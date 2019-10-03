export interface User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  zipcode: string;
  address: string;
  address2: string;
  birthdate: string;
  tierLevel: number;
  state: string;
  country: string;
  city: string;
  availableMfa: string[];
  mfa: boolean;
  softwareMfa: boolean;
  phoneVerified: boolean;
  trackingAddresses: string[];
  last_login_at: string;
  last_login_ip: string;
  avatar: string;
}
