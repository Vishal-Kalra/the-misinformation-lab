// DEPRECATED — no longer imported anywhere. Safe to delete this file.
//
// This used to be a second, separate "build a post" form (source/headline/
// image, with its own tactic-based generator and its own AI-visual button)
// feeding the community pool, living behind the old Contribute tab. That
// duplicated the main composer's post-building logic for no real reason —
// submitting to the pool now just reuses whatever post the learner already
// built for Publish. See:
//   - Phase2.jsx: `submitToPool()` and the "Also submit this post..." link
//   - ImagePicker.jsx: the merged "curated / upload / AI visual" image picker
//   - services/communityPool.js: `buildCommunityPost()`, now takes the real
//     post's source/headline/image/signals directly instead of a tactic id
//
// Left in place only because this environment can't delete files — remove
// it (`git rm src/components/phase2/ContributePanel.jsx`) whenever convenient.
