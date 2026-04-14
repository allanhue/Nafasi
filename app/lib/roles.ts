// set up the roles 

export const ROLES = {
    //owner 
  SYSTEM_ADMIN: 'system_admin',
  //related to inventory and warehouse management
  WAREHOUSE_MANAGER: 'warehouse_manager', //leased a space 
  //related to rentals 
  LANDLORD: 'landlord',
    TENANT: 'tenant',  //rents a house 

    //reated to space booking and management
  SPACE_MANAGER: 'space_manager',
  USER: 'user', // buys tickets, books spaces, etc.
  // Backward-compat alias (some files may still reference ROLES.User)
  User: 'user',


} as const; 
