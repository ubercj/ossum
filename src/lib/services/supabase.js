import { supabase } from '../supabaseClient';

/**
 * @param {string} userId
 */
export const getUserProfile = async (userId) => {
	return await supabase
		.from('profiles')
		.select('username, website, avatar_url, shirt_size, pull_requests')
		.eq('id', userId)
		.single();
};

/**
 * @param {string} userId
 * @param {Profile} updates
 */
export const updateUserProfile = async (userId, updates) => {
	return await supabase
		.from('profiles')
		.upsert({ id: userId, updated_at: new Date().toISOString(), ...updates });
};

/**
 * @param {string} userId
 */
export const getGroups = async (userId) => {
	return await supabase
		.from('groups')
		.select(
			`
          id,
          name,
          group_profile!inner (
            id
          )
        `
		)
		.eq('group_profile.profile_id', userId);
};

/**
 * @param {number} groupId
 */
export const getProfilesForGroup = async (groupId) => {
	return await supabase
		.from('profiles')
		.select(
			`
          id,
          username,
           website,
           avatar_url,
           shirt_size,
           pull_requests,
           group_profile!inner (
            id,
            group_id
            )
          `
		)
		.eq('group_profile.group_id', groupId);
};
