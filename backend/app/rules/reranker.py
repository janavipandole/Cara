from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
import logging

logger = logging.getLogger(__name__)

class PersonalizedReranker:
    # Interaction type weights for preference profile calculation
    WEIGHTS = {
        "buy": 5.0,
        "wishlist": 3.0,
        "cart": 2.5,
        "click": 1.5,
        "view": 1.0
    }

    @classmethod
    def get_user_preferences(cls, db: Session, hashed_user_id: str):
        """
        Retrieves user preferences (brands, colors, styles) from their interaction history.
        """
        if not hashed_user_id:
            return {}, {}, {}

        # Fetch recent interactions
        interactions = (
            db.query(models.Interaction)
            .filter(models.Interaction.user_id == hashed_user_id)
            .order_by(models.Interaction.created_at.desc())
            .limit(100)
            .all()
        )

        brand_scores = {}
        color_scores = {}
        style_scores = {}

        for interaction in interactions:
            product = interaction.product
            if not product:
                continue

            weight = cls.WEIGHTS.get(interaction.interaction_type, 1.0)

            # Accumulate brand preference
            if product.brand:
                brand_scores[product.brand] = brand_scores.get(product.brand, 0.0) + weight

            # Accumulate color preference
            if product.color:
                color_scores[product.color.lower()] = color_scores.get(product.color.lower(), 0.0) + weight

            # Accumulate style preference
            if product.style:
                style_scores[product.style.lower()] = style_scores.get(product.style.lower(), 0.0) + weight

        return brand_scores, color_scores, style_scores

    @classmethod
    def rerank(cls, db: Session, hashed_user_id: str, candidates: list) -> list:
        """
        Reranks recommendation candidates based on the user preference profile.
        """
        if not hashed_user_id or not candidates:
            return candidates

        try:
            brand_prefs, color_prefs, style_prefs = cls.get_user_preferences(db, hashed_user_id)
        except Exception as e:
            logger.error(f"Error fetching preferences for reranking: {e}")
            return candidates

        scored_candidates = []
        for index, item in enumerate(candidates):
            # Base similarity score from rank position (FAISS order)
            # Higher index = lower FAISS similarity.
            similarity_score = 100.0 - (index * 2.0)

            personalization_bonus = 0.0

            # Match Brand
            if item.brand in brand_prefs:
                personalization_bonus += brand_prefs[item.brand] * 2.5

            # Match Color
            if item.color and item.color.lower() in color_prefs:
                personalization_bonus += color_prefs[item.color.lower()] * 1.5

            # Match Style
            if item.style and item.style.lower() in style_prefs:
                personalization_bonus += style_prefs[item.style.lower()] * 2.0

            total_score = similarity_score + personalization_bonus
            scored_candidates.append((total_score, item))

        # Sort descending by personalized total score
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        return [item for _, item in scored_candidates]
