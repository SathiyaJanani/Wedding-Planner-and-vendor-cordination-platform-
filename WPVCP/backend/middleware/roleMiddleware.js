function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role_name) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Authentication required.'
      });
    }

    if (req.user.role_name === 'ADMIN' || allowedRoles.includes(req.user.role_name)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden. This operation requires one of the following roles: [${allowedRoles.join(', ')}]. You are logged in as ${req.user.role_name}.`
    });
  };
}

module.exports = authorizeRoles;
