PatchCountdown.tsx -
Update these by hand at the start of each new patch — there's no auto-detection, by design (patch length isn't fixed and the next version's date is often unconfirmed for a while after the current one launches).

PATCH_END: ISO datetime string with UTC offset for when the current patch is expected to end / the next one begins.
PATCH_END_CONFIRMED: set to true once the date is officially announced (currently false — the "(projected)" tag next to the day count reflects this). Set back to false and update PATCH_END each time a new patch starts.