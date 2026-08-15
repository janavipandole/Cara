/**
 * Mock Role-Based Access Control (RBAC) Middleware Setup
 * Simulates enforcing granular permissions on backend API routes
 * based on user roles and assigned atomic permissions.
 */

export class RBACManager {
  constructor() {
    // Mock database of roles and their granular permissions
    this.roles = {
      'SuperAdmin': ['*'], // Has all permissions
      'StoreManager': [
        'read:products', 'write:products', 'delete:products',
        'read:orders', 'write:orders',
        'read:users'
      ],
      'SupportStaff': [
        'read:products',
        'read:orders', 'write:orders',
        'read:users'
      ],
      'ContentCreator': [
        'read:products',
        'read:blogs', 'write:blogs'
      ],
      'User': [
        'read:products',
        'read:own_orders', 'write:own_orders'
      ]
    };
  }

  /**
   * Helper to check if a role has a specific permission.
   * Handles wildcard ('*') permissions for SuperAdmins.
   */
  hasPermission(role, requiredPermission) {
    if (!this.roles[role]) return false;
    
    const rolePermissions = this.roles[role];
    if (rolePermissions.includes('*')) return true;

    return rolePermissions.includes(requiredPermission);
  }

  /**
   * Express-style middleware factory to protect API routes.
   * @param {string} requiredPermission - The atomic permission required (e.g., 'write:products')
   */
  requirePermission(requiredPermission) {
    return (req, res, next) => {
      // Mock extracting user info from JWT token (usually done by auth middleware before this)
      const user = req.user; 

      if (!user || !user.role) {
        console.warn(`[RBAC] Access denied: User not authenticated or missing role.`);
        return res.status(401).json({ error: 'Unauthorized: Missing valid token or role.' });
      }

      const hasAccess = this.hasPermission(user.role, requiredPermission);

      if (!hasAccess) {
        console.warn(`[RBAC] Access denied: Role '${user.role}' lacks permission '${requiredPermission}'`);
        return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
      }

      console.log(`[RBAC] Access granted: Role '${user.role}' authorized for '${requiredPermission}'`);
      next();
    };
  }
}

// Usage Example for securing Express routes:
// const rbac = new RBACManager();
// 
// // This route requires the 'write:products' permission
// app.post('/api/products', 
//   authMiddleware.verifyToken, 
//   rbac.requirePermission('write:products'), 
//   (req, res) => {
//     // ... logic to create a new product ...
//     res.json({ message: 'Product created successfully.' });
//   }
// );
