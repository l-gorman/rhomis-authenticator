# /
- return Welcome message

- **/api/user (Auth.js)**
  - GET /: Gets lots of info on "current" user (based on user passed in request)
  - POST /register: Create new user
  - POST /login: Login user
  - POST /update: Update user (WIP)
  - POST /project-manager: Make a user a project manager of a project
  - POST /data-collector: Make a user a data collector of a project
  - POST /analyst: Make a user an analyst of a project
  - DELETE /delete: Delete a user based on ID
- **/api/projects (projects.js)**
  - POST /create: Create a project
  - DELETE /delete: Delete a project
  - POST /assign: Assign a user (WIP)
  - POST /unassign: Unassign a user (WIP)
- **/api/forms (forms.js)**
  - POST /publish: Finalise a form
  - POST /new-draft: Update the draft on ODK central for a form
  - POST /new: Create a new form on ODK central;
- **/api/metadata (metaData.js)**
  - POST /: Get lots of info on "current" user (based on user passed in request)
- **/api/admin (makeAdmin.js)**
  - POST /: Make a user an admin


## Questions
- can GET from api/user be merged with POST from /api/meta-data? 
- How does admin or project lead get info on a different user? 

## NOTES

- should make api handle the formVersion
- could add HTTPERrror ?? 