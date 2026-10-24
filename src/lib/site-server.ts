import { getPool } from "./db";
import { defaultSiteConfig } from "./site";

export async function getSiteConfig() {
  const config = { ...defaultSiteConfig, phones: [...defaultSiteConfig.phones] };
  try {
    const pool = getPool();
    const result = await pool.query("SELECT key, value FROM site_settings");
    result.rows.forEach((row) => {
      // Map snake_case to camelCase mapping for some keys
      if (row.key === 'primary_phone' && row.value) {
        config.phones[0] = row.value;
      } else if (row.key === 'secondary_phone' && row.value) {
        config.phones[1] = row.value;
      } else if (row.key === 'email' && row.value) {
        config.email = row.value;
      } else if (row.key === 'service_area' && row.value) {
        config.serviceArea = row.value;
      } else if (row.key === 'office_address' && row.value) {
        config.officeAddress = row.value;
      } else if (row.key === 'map_url' && row.value) {
        config.mapUrl = row.value;
      } else if (row.key === 'tagline' && row.value) {
        config.tagline = row.value;
      } else if (row.key === 'business_name' && row.value) {
        config.name = row.value;
      } else if (row.key === 'instagram_url' && row.value) {
        config.instagramUrl = row.value;
      } else if (row.key === 'linkedin_url' && row.value) {
        config.linkedinUrl = row.value;
      }
    });
  } catch (error) {
    console.error("Error fetching site config from DB:", error);
  }
  return config;
}
