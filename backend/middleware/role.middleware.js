// Role-based access control middleware

/**
 * allowRoles middleware
 * Checks if the configured roles contain the current user's role.
 * Example: allowRoles("viewer", "analyst", "admin")
 */
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User role not found",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

export const isViewer = allowRoles("viewer", "analyst", "admin");
export const isAnalyst = allowRoles("analyst", "admin");
export const isAdmin = allowRoles("admin");