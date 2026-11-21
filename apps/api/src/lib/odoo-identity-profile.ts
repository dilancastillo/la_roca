import type { OdooEnv } from './app-env.js';
import { PRODUCTION_ATTRIBUTE_TO_TRAINING, PRODUCTION_VALUE_TO_TRAINING, PRODUCTION_PTAV_TO_TRAINING } from './odoo-production-identities.js';
export type OdooIdentityProfile = 'training' | 'laroca-production';
/** Visual identities stay in the namespace in which the SVGs were authored.
 * Transactional PTAV IDs NEVER change: exclusions, selections, custom values,
 * variant creation and sale-line writes always use the connected Odoo's IDs. */
export function getOdooIdentityProfile(env: OdooEnv): OdooIdentityProfile {
    const explicit = env.ODOO_ID_PROFILE?.trim();
    if (explicit) {
        if (explicit !== 'training' && explicit !== 'laroca-production') {
            throw new Error('ODOO_ID_PROFILE debe ser training o laroca-production.');
        }
        return explicit;
    }
    // Scope the automatic profile to the documented database, not Vercel's
    // Production/Preview flag: both can point to either Odoo database.
    const host = env.ODOO_BASE_URL?.replace(/\/+$/, '').toLowerCase();
    return env.ODOO_DB?.trim() === 'larocadotaciones' && host === 'https://larocadotaciones.odoo.com'
        ? 'laroca-production' : 'training';
}
export function toVisualAttributeId(profile: OdooIdentityProfile, id: number) {
    return profile === 'laroca-production' ? PRODUCTION_ATTRIBUTE_TO_TRAINING[id] ?? id : id;
}
export function toVisualSourceValueId(profile: OdooIdentityProfile, id: number) {
    return profile === 'laroca-production' ? PRODUCTION_VALUE_TO_TRAINING[id] ?? id : id;
}
const trainingPtavToProduction = new Map(Object.entries(PRODUCTION_PTAV_TO_TRAINING).map(([production, training]) => [training, Number(production)]));
export function toLivePtavId(profile: OdooIdentityProfile, historicalId: number) {
    return profile === 'laroca-production' ? trainingPtavToProduction.get(historicalId) ?? historicalId : historicalId;
}
