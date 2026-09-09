# Workflow & Process Automation Best Practices

- Evaluate in order: (1) standard SAP business workflow / SAP-delivered scenario, (2) Flexible Workflow (scenario + rules in Manage Workflows apps), (3) SAP Build Process Automation on BTP, (4) custom workflow. Stop at the first that fits.
- Prefer Flexible Workflow for approval patterns on S/4HANA — business users maintain steps, agents, and conditions through configuration apps with no development.
- Use SAP Build Process Automation when the process spans multiple systems, needs decisions/business rules, or requires a designed approval UI beyond My Inbox.
- Keep the workflow definition free of business logic — call released APIs / RAP actions for the actual work; the workflow orchestrates, it does not calculate.
- Model agent determination through rules or responsibility rules, not hard-coded user lists.
- Surface tasks in the standard My Inbox / Situation Handling rather than a bespoke task UI where possible.
- Design for exceptions explicitly: deadlines, escalation, no-agent-found, withdrawal/restart — do not leave a stuck instance with no path forward.
- Confirm platform: Flexible Workflow needs S/4HANA; SAP Build Process Automation needs a BTP subaccount with the entitlement.
