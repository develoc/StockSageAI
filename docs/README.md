# StockSageAI Documentation

This folder contains legal and informational documentation for the StockSageAI platform.

## Contents

1. [Privacy Policy](privacy-policy.md) - Details how user data is collected, used, and protected
2. [Terms and Conditions](terms-and-conditions.md) - Legal agreement governing usage of the platform

## Using These Documents

These legal documents are provided in markdown format for ease of editing and version control. They are served through both:

1. Backend API endpoints at `/api/docs/privacy-policy` and `/api/docs/terms-and-conditions`
2. Static files in the frontend public directory

## Implementation Details

The documents are rendered in React components using the markdown-it library to convert markdown to HTML. They're accessible via:

- `/privacy-policy` - Privacy Policy page
- `/terms-and-conditions` - Terms and Conditions page

## Updating Documentation

When updating these documents:

1. Edit the markdown files in this directory
2. Update the "Last Updated" date at the top of each document
3. Make sure the changes are reflected in both locations:
   - `/docs/` (this directory)
   - `/client/public/docs/` (frontend static files)

## Legal Considerations

These documents should be reviewed by legal counsel before being used in a production environment. They are provided as templates and will need customization based on:

- Jurisdiction-specific requirements
- Actual data collection practices
- Business operations
- User rights
