# Mobile Report Execution Roadmap

Status date: 2026-06-03

This roadmap tracks the OTOTR mobile report flow built on the imported Otorapor inspection catalog.

## First 20 Work Items

1. Use `inspection_schema_normalized.json` as the mobile report source of truth. Status: done.
2. Document the mobile report design direction. Status: done.
3. Show catalog group metrics on report group cards. Status: done.
4. Add body paint quick panel/micron entry card. Status: done.
5. Add body paint quick status chips. Status: done.
6. Keep micron-required quick selections as draft until measurement is entered. Status: done.
7. Split body paint points into operational sections. Status: done.
8. Add body paint section completion counters. Status: done.
9. Add body paint filters: all, missing, completed, measurement, evidence. Status: done.
10. Add filter counts and empty filter state. Status: done.
11. Keep evidence-required quick selections as draft until evidence is added. Status: done.
12. Show measurement/evidence requirement badges on point rows. Status: done.
13. Add test coverage for evidence-required quick selection behavior. Status: done.
14. Improve body paint row summary for draft vs completed answers. Status: done.
15. Add one-tap filter reset from empty state. Status: done.
16. Add section-level missing count after filters. Status: done.
17. Add customer-friendly note requirement for risk findings. Status: done.
18. Add negative/risky option evidence gate mapping. Status: done.
19. Add final report customer preview grouping for body paint. Status: done.
20. Add final report data contract document for body paint output. Status: done.

## After First 20

21. Apply the same catalog-driven UX pattern to `MOTOR_CHECKUP`. Status: done.
22. Apply the same catalog-driven UX pattern to `MECHANICAL_CHECKUP`. Status: done.
23. Apply the same pattern to OBD/Airbag groups. Status: done.
24. Apply the same pattern to brake, suspension, dyno and road test groups. Status: done.
25. Add report gate screen details per missing catalog point. Status: local service/test done.
26. Add manager technical approval workflow. Status: local service/test done.
27. Add customer report preview language and legal-safe summaries. Status: local service/test done.
28. Add report PDF output contract. Status: local service/test done.
29. Add QR/public report verification contract. Status: local service/test done.
30. Add media album mapping for evidence photos. Status: local service/test done.
31. Add report revision flow. Status: local service/test done.
32. Add live Supabase RPC contract verification. Status: local checklist done; live/staging run requires approval.
33. Add RLS role matrix tests for report access. Status: local checklist done; live/staging run requires approval.
34. Add package-based report point visibility. Status: local service/test done.
35. Add branch/customer delivery workflow. Status: local service/test done.
36. Add audit log display for report changes. Status: local service/test done.
37. Add technician performance and report quality metrics. Status: local service/test done.
38. Add mobile offline sync conflict handling for report answers. Status: local service/test done.
39. Add staging smoke test workflow. Status: local checklist done; staging run requires approval.
40. Add final release checklist for report MVP. Status: local service/test done.

## Current Rule

The first 20 items must be closed before moving the same depth of UX work into the other report groups.
