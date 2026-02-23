# Albert's Repos Guide

This file is version controlled in the `albert-analysis` repo as `GLOBAL_CLAUDE.md`. Copy it to a top-level directory that contains all the cloned repos described below and rename it to `CLAUDE.md`. Then run Claude Code CLI on that top-level directory.

The following are repositories that house essentially all of my important personal files.

They are Git repositories, not because I have any particular need for version control, but rather because it makes it easier to track a history of additions in a form factor I know well.

## File naming conventions
As much as possible, documents are named with a date, an entity (organization or person), and a topic. An example would be `2006-12-23 Safety Insurance - Declaration.pdf`, which tells me it's an insurance policy declaration from the insurer Safety Insurance, issued on December 23, 2006.

## Directory naming conventions and breakdowns

In most cases, directories are named in snake_case. An example would be `property_110_tudor_st` under the `albert-business` repo, which tells me it contains all the files related to an asset which is the property I own at 110 Tudor St.

In some cases, directories may be named in plain language. An example would be `2025-02-08 MassSave (HomeWorks Energy) - Wall Insulation Proposal`. While rare, if you encounter a directory named in plain language, it's likely because it's some kind of one-off project that needs to be more descriptive than a reasonable snake_case string can allow for.

Finally, you may encounter directories that are in kebab-case. An example would be `refinance-2021`, or even the top-level directories like `albert-business`. Honestly, in practically all circumstances of this there's no real reason it had to be named in kebab-case, and could have been just as well (and more consistently) represented in snake_case. So I would ignore any significance to the fact that a directory was named in kebab-case and if you ever have to choose, just stick with snake_case to be consistent with the majority of named folders.

## Navigation

All top-level directories are Git repository clones, and they are broken down as follows:

### `albert-analysis`

This is where all analyses should be stored and displayed. It also contains some scripts to run analyses. Any analyses done via AI should create and update data artifacts (JSON files, etc.) in this folder. This is essentially the "working directory" for all analysis and analytics.

### `albert-business`

This repo contains documents pertaining to assets (homes, cars, investments, taxes) and vendors/services I use.

* `auto-all` - Documents having to do with cars we own or previously owned
* `cooking` - Where I store recipes I like making. It probably should be in another repo or in Notion as a knowledge base item, but is here probably for legacy reasons.
* `lt_investments` - Documents related to long-term investments I've made, usually angel investments in early stage startups or SPVs, but could also be fund investments. It includes notes from calls during which I was considering an investment (that I may or may not have subsequently made).
 * `EXITED` - A sub-folder of exited investments. Investments that experience an exit or dissolution event are moved into this.
* `property_110_tudor_st` - Documents related to my rental asset that is a single family home at 110 Tudor St, Boston, MA 02127
 * `community` - Mostly notices from City of Boston, but also includes purchase inquiries, interesting ads received, interactions with neighbors, abutters notices, and other neighborhood things.
 * `major_projects` - Any house project worth documenting deeply (usually because it was big in nature, a capital improvement, had a lot of moving pieces, etc.).
 * `marketing` - Assets related to the marketing of the property for short, medium, or long-term rental.
 * `public_documents` - Docs about or related to the property that is also accessible to the general public.
 * `purchase` - Everything related to the purchase of the property.
 * `service_providers` - Services that are specific to this property.
  * `CLOSED` - A sub-folder of service providers whose accounts have been closed (I am no longer using them).
 * `tenants` - Leases for current and past long-term tenants, along with lease templates.
* `property_69_hitching_post_lane` - Documents related to my primary residence asset that is a single family home at 69 Hitching Post Ln, Bedford, NH 03110
 * `community` - Mostly notices from Town of Bedford, but also includes purchase inquiries, interesting ads received, interactions with neighbors, abutters notices, and other neighborhood things.
 * `major_projects` - Any house project worth documenting deeply (usually because it was big in nature, a capital improvement, had a lot of moving pieces, etc.).
 * `public_documents` - Docs about or related to the property that is also accessible to the general public.
 * `purchase` - Everything related to the purchase of the property.
 * `service_providers` - Services that are specific to this property.
  * `CLOSED` - A sub-folder of service providers whose accounts have been closed (I am no longer using them).
* `property_933_tennyson_dr` - Documents related to my rental asset that is a single family home at 933 Tennyson Dr, Charlotte, NC 28208
 * `design` - Everything related to the design phase of the short-term rental amenities.
 * `public_documents` - Docs about or related to the property that is also accessible to the general public.
 * `purchase` - Everything related to the purchase of the property.
 * `service_providers` - Services that are specific to this property.
  * `CLOSED` - A sub-folder of service providers whose accounts have been closed (I am no longer using them).
* `service_providers` - Documents related to any service I use personally, such as financial accounts (checking, brokerage, credit cards, etc.), insurance policies, communication (ex: AT&T), daycare, public school, etc. It also includes notes from calls during which I was considering that service provider or gathering information. It may also include subfolders of documents related to alternative service providers that I was evaluating alongside the one I eventually chose. Note that there is a `service_providers` folder under each property that contains property-specific service providers.
 * `CLOSED` - A sub-folder of service providers whose accounts have been closed (I am no longer using them).
 * `health_insurance` - A particularly significant sub-folder containing everything related to health insurance, including all currently active policies and HSAs, and also elections and considerations during open enrollment periods.
* `taxes_financial` - All receipts for all personal payments and tax filings, split by year. For each year, there is the following structure:
 * A ledger file for the year: either an `.xlsx` file (legacy) or a `.webloc` link to a Google Sheet (the new way)
 * `receipts` - Directory of all receipts (majority are PDFs, and in rare circumstances, image or text files)
  * `business` - Transactions related to passthrough businesses we are a part of. It is split between each distinct business. The vast majority of transactions are either capital contributions and shareholder distributions. It does NOT include tax-related statements like K-1s, as those will show up under `tax_filings` instead.
  * `[EMPLOYER_NAME]` - There will be a folder for each W-2 employer I worked for that year. The vast majority of documents here are payroll statements. It does NOT include tax-related statements like W-2s, 1099s, W-4s, or W-9s, as those will show up under `tax_filings` instead.
  * `credit_card` - Monthly credit card payments for each credit card, when there is a balance to pay.
  * `home` - Transactions related to my primary residence asset at 69 Hitching Post Ln, Bedford, NH 03110.
  * `major_purchase` - A catch-all for transactions significant enough to track. The vast majority of these are groceries and meal purchases, not necessarily because they are significant but so I can track major life category spending.
   * `auto_payments` - Car servicing, insurance premium payments, tolls, and registrations.
   * `daycare_payments` - Daycare tuition payments and daycare FSA reimbursements.
   * `gym_payments` - Gym membership payments.
   * `navia_transit_benefits` - Transit and parking contributions for commuter benefits FSA.
   * `phone_payments` - Family phone plan payments and reimbursements from family members.
   * `reimbursements` - Reimbursements payments typically from employers or FSAs.
  * `medical` - Transactions related to medical services. Mostly co-pays or co-insurance payments for healthcare visits, blood draws, and medication. Occasionally there may be medical supplies, device, or equipment purchases. Also includes health insurance premium payments for COBRA or marketplace plans.
  * `real_estate_110` - Transactions related to rental of the asset 110 Tudor St, Boston, MA 02127.
   * `expense_receipts` - All expenses (maintenance, supplies, capital improvements, etc.)
    * `cable_internet_payments` - Payments to internet service.
    * `electric_payments` - Payments to electric service.
    * `gas_payments` - Payments to gas service.
    * `mortgage_payments` - Monthly mortgage payments.
    * `water_sewer_payments` - Payments to water & sewer service.
   * `rent_payments` - Payments from tenants (including Airbnb payouts)
  * `real_estate_933` - Transactions related to rental of the asset 933 Tennyson Dr, Charlotte, NC 28208. 
   * `expense_receipts` - All expenses (maintenance, supplies, capital improvements, etc.)
    * `cable_internet_payments` - Payments to internet service.
    * `electric_payments` - Payments to electric service.
    * `gas_payments` - Payments to gas service.
    * `mortgage_payments` - Monthly mortgage payments.
    * `water_sewer_payments` - Payments to water & sewer service.
   * `rent_payments` - Payments from tenants (including Airbnb payouts)
  * `student_loan` - Monthly payments for student loan.
  * `unemployment` - Payments from an state unemployment claims.
 * `statements` - All tax statements like W-2s, 1099s, K-1s, 1095 healthcare statements, 1098 loan interest statements, etc. It is split between recipients (Albert and Laura) since we started filing as married-filing-jointly in 2017.
 * `tax_filings` - All tax returns, confirmations, W-9 or W-4 filings, IRS notices, state DOR notices, and audit defense policies.

### `albert-employment`

This repo contains documents pertaining to my current and past employment or contracting. Every sub-folder is an current or previous employer except for two special folders:
* `interviews` - Contains all documents related to job interviews, split by year.
* `unemployment` - Contains all documents related to unemployment claims, split by time period / entity.

### `albert-personal`

This repo contains documents pertaining to personal non-business pursuits, hobbies, things of sentimental or nostalgic value (such as holiday and thank you cards, and event programs), and other random things in my life. A couple special sub-folders to note:
* `focus_groups` - Documents related to focus groups I was a part of.
* `violation_tickets` - Documents related to citations, tickets, violations (toll, transit, speeding, etc.).

### `albert-profile`

This repo contains documents pertaining to identity, medical records, and achievements. It also contains files I manage on behalf of others in my family (usually having to do with identity or medical records). The top-level has all of my personal identity documents, while the following folder structure contains other documents:
* `2fa_recovery_codes` - 2-factor authentication recovery codes for services I use.
* `credit_reports` - Self-pulled credit reports from the credit bureaus.
* `cyrus` - Everything related to my cat Cyrus, particularly medical (veterinary) records, and also his purchase records.
* `gwyneth` - Everything related to my daughter Gwyneth Isla Kwasniewski Ho, particularly identity and medical records.
* `laura` - Various documents for my wife Laura Kwasniewski, particularly identity and medical records.
* `leonard` - Everything related to my son Leonard Quentin Kwasniewski Ho, particularly identity and medical records.
* `marriage` - Marriage documents for my marriage to my wife Laura Kwasniewski.
* `medical_history` - MY personal medical documents across my whole life.
* `michelle` - Various documents for my sister Michelle Ho, particularly birth documents that I had to take (and sent to her) from our parents' house after we realized those documents were at risk given my mother's brain degeneration.
* `patents_publications` - Patents for which I was either the representing patent agent or the inventor (or both), publications, and any press I've ever gotten in the past.
* `recommendations` - Written recommendations I've received.
* `resumes` - All current and past versions of my resume.
* `treasure` - Everything related to my dog Treasure, particularly medical (veterinary) records, and also her purchase records.
* `uspto_registered_agent` - Everything related to my license to practice patent prosecution before the United States Patent & Trademark Office.
* `voter_registration` - All current and past voter registrations.
* `will` - Will & testament for me and Laura.
* `yealing_peigee` - Everything I'm involved with regarding my parents Yea-Ling Ho (mom) and Pei-Gee Ho (dad). Particuarly medical records from when I accompany either of them to healthcare providers to manage their chronic illnesses. 

### `albertho.net`

This is my personal website. It is a NextJS application.
