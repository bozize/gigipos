export interface BusinessConfig {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId?: string;
    logo?: string;
    footer?: string;
  }
  
  export const businessConfig: BusinessConfig = {
    name: "Your Business Name",
    address: "123 Business Street, City, Country",
    phone: "+1234567890",
    email: "business@example.com",
    taxId: "TAX-12345",
    footer: "Thank you for your business!"
  };