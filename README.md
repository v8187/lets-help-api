# lets-help-api

## Routes

### __Auth__

| Method | Path | Params | Auth Token |
|---|---|---|---|
| POST | /auth/hasAccount | email | N/a
| POST | /auth/register | email, userPin | N/a
| PUT | /auth/updatePin | email, newUserPin | Required
| POST | /auth/login | email, userPin | N/a
| POST | /auth/logout | | N/a

<hr>
  

### __API__

| Method | Path | Params | Auth Token |
|---|---|---|---|
| GET | /api/user/profile | | Required
| PUT | /api/user/profile | | Required

<hr>
