from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    img = Column(String)
    rating = Column(Integer)
    category = Column(String, index=True) # street, minimal, formal
    subcategory = Column(String, index=True, nullable=True) # e.g. top, bottom, shoes
    color = Column(String, nullable=True)
    style = Column(String, nullable=True)
    
class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # IP or generic session id
    product_id = Column(Integer, ForeignKey("products.id"))
    interaction_type = Column(String) # click, view, buy
    
    product = relationship("Product")
