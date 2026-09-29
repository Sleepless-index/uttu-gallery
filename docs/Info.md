## PatchCountdown.tsx -
Update these by hand at the start of each new patch — there's no auto-detection, by design (patch length isn't fixed and the next version's date is often unconfirmed for a while after the current one launches).

PATCH_END: ISO datetime string with UTC offset for when the current patch is expected to end / the next one begins.
PATCH_END_CONFIRMED: set to true once the date is officially announced (currently false — the "(projected)" tag next to the day count reflects this). Set back to false and update PATCH_END each time a new patch starts.

# Guess Arcanist notes

Route: `/playground/guess-arcanist`, linked from the Playground group in `components/layout/Sidebar.tsx`.

## Rules
- 5 guesses per round (`MAX_GUESSES` in `lib/playground/guessArcanist.ts`). Fifth wrong guess ends the round as lost and the answer is revealed on the page.
- Clues per guess: rarity and version give an arrow toward the answer, afflatus and race are match or no match. Comparison lives in `compareGuess` in `lib/playground/guessArcanist.ts`.
- Version clue shows no arrow when either side is an event tag like `s01`, since those have no order.

## Pool and Hide CN
- The pool comes from `visibleRoster(hideCn)` in `lib/data/roster.ts`, so CN-only arcanists are never picked as answers or offered in the search box when Hide CN is on.
- Toggling Hide CN changes the pool. `ensureRounds` in `lib/playground/guessArcanist.ts` replaces any saved round whose answer or guesses fall outside the new pool, so the current round restarts. The daily answer also differs between Hide CN on and off because it is drawn from the pool.

## Daily mode
- Resets at 10:00 UTC. `dailyIndex` in `lib/playground/guessArcanist.ts` turns a timestamp into a day number, and `pickDailyTarget` seeds a small PRNG with that number over the id-sorted pool, so every device gets the same answer for the same pool.
- Streak rules are in `applyGuess`: a win on the day after the last win extends the streak, a loss resets it, and `effectiveStreak` shows 0 when a full day was skipped.

## Unlimited mode
- Random answer, never the same one twice in a row. "New arcanist" calls `newUnlimited` in `lib/hooks/useGuessArcanist.ts`. Does not touch the streak.

## Storage
- Own localStorage key `r1999-guess-arcanist` (`GUESS_STORAGE_KEY`), separate from `r1999-case-file`. Holds the daily round, the unlimited round and the streak.

## Search box
- `components/playground/ArcanistSearch.tsx`. Matching ignores case and accents, prefix matches sort first, already guessed arcanists are excluded through the `excludedIds` prop.
- Keyboard: arrow keys move, Enter picks the highlighted row, Escape closes. The list opens upward below `md` so the mobile keyboard does not cover it.

## Shared for the art guess
- `ArcanistSearch` takes `pool`, `excludedIds` and `onPick` only, so the art guess page can reuse it as is.
