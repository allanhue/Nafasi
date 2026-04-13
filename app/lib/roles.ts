// set up the roles 

import { User } from "lucide-react";

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
    User: 'user', // buys tickets, books spaces, etc.


} as const; 