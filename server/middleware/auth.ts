import { Request, Response, NextFunction } from "express";
import { UserRoles } from "@shared/schema";

// Types for role-based access control
type Role = typeof UserRoles[keyof typeof UserRoles];
type RoleCheck = Role | Role[] | "any_authenticated";

// Middleware to check if the user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized: Login required" });
}

// Middleware to check if the user has a specific role
export function hasRole(role: RoleCheck) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized: Login required" });
    }

    const userRole = req.user.role || UserRoles.USER;
    
    // If we just need any authenticated user, proceed
    if (role === "any_authenticated") {
      return next();
    }
    
    // Check if user has one of the required roles
    if (Array.isArray(role)) {
      if (role.some(r => r.toLowerCase() === userRole.toLowerCase())) {
        return next();
      }
    } else { // Check for single role
      if (role.toLowerCase() === userRole.toLowerCase()) {
        return next();
      }
    }
    
    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
  };
}

// Middleware to check if user is an administrator
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized: Login required" });
  }

  const userRole = req.user.role || '';
  
  if (userRole.toLowerCase() === UserRoles.ADMIN.toLowerCase()) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden: Administrator access required" });
}

// Middleware to check if user is an admin or manager
export function isAdminOrManager(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized: Login required" });
  }

  const userRole = req.user.role || '';
  
  if (
    userRole.toLowerCase() === UserRoles.ADMIN.toLowerCase() || 
    userRole.toLowerCase() === UserRoles.MANAGER.toLowerCase()
  ) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden: Administrator or Manager access required" });
}

// Middleware to check if user is accessing their own data or is an admin
export function isSelfOrAdmin(userIdParam: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized: Login required" });
    }

    const paramUserId = parseInt(req.params[userIdParam], 10);
    const userRole = req.user.role || '';
    
    // Allow if user is accessing their own data
    if (req.user.id === paramUserId) {
      return next();
    }
    
    // Allow if user is an administrator
    if (userRole.toLowerCase() === UserRoles.ADMIN.toLowerCase()) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden: You can only access your own data" });
  };
}