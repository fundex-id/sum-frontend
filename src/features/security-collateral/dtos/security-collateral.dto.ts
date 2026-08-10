import { SecurityCollateralAuditTrail, SecurityCollateralID, SecurityCollateralInfo, SecurityCollateralParent, SecurityCollateralVerificationAll } from "../types/security-collateral.type";

export interface SecurityCollateralItemResponse 
extends SecurityCollateralID,
    SecurityCollateralParent,
    SecurityCollateralInfo,
    SecurityCollateralVerificationAll {}
  

export interface SecurityCollateralFormRequest 
extends SecurityCollateralParent,
    SecurityCollateralInfo,
    SecurityCollateralVerificationAll {}
  
  export interface SecurityCollateralEditFormResponse 
extends SecurityCollateralParent,
    SecurityCollateralInfo,
    SecurityCollateralVerificationAll {}
  