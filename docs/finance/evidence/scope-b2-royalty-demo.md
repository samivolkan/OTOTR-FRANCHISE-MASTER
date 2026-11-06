# SCOPE-B2 royalty demo configuration

Environment is ototr-staging. This is synthetic test evidence. Production tax-code approval remains pending.

| ERP operation | Customer gross | Royalty before tax | Demo tax | Royalty gross |
| --- | ---: | ---: | ---: | ---: |
| First settled collection | 600.00 TRY | 60.00 TRY | 12.00 TRY | 72.00 TRY |
| Second settled collection | 400.00 TRY | 40.00 TRY | 8.00 TRY | 48.00 TRY |
| Partial refund of the first collection | 200.00 TRY | -20.00 TRY | -4.00 TRY | -24.00 TRY |

Apply 10 percent to the entire settled customer gross amount. Apply 20 percent demo tax to the resulting royalty amount. The refund reverses the corresponding portion of the first collection and retains its reference. Expected open royalty balance is 96.00 TRY after both collections and the refund.

Applies to the DEMO-SCOPE-B2-ROYALTY rule in the November 2026 staging period, from the rule's effective date. This document describes expected results. ERP initiation and both role checks remain pending.
