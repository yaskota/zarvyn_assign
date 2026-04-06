export const sanitizeData = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!Array.isArray(obj[key])) {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

export const validateAuth = (req, res, next) => {
  const { name, email, password } = req.body;
  if (req.path === '/register' && (!name || typeof name !== 'string' || name.trim() === '')) {
    return res.status(422).json({ success: false, message: "Name is required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(422).json({ success: false, message: "Valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(422).json({ success: false, message: "Password must be at least 6 characters" });
  }
  next();
};

export const validateTransaction = (req, res, next) => {
  const { amount, type, category, date } = req.body;
  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return res.status(422).json({ success: false, message: "Amount must be a positive number greater than 0" });
  }
  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(422).json({ success: false, message: "Type must be 'income' or 'expense'" });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(422).json({ success: false, message: "Valid category is required" });
  }
  if (!date || isNaN(new Date(date).getTime())) {
    return res.status(422).json({ success: false, message: "Valid date is required" });
  }
  next();
};

export const validateUserUpdate = (req, res, next) => {
  const { email, password, role } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, message: "Valid email is required" });
  }
  if (password && password.length < 6) {
    return res.status(422).json({ success: false, message: "Password must be at least 6 characters" });
  }
  if (role && !['viewer', 'analyst', 'admin'].includes(role)) {
    return res.status(422).json({ success: false, message: "Role must be viewer, analyst, or admin" });
  }
  next();
};
