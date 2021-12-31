# log-out-model
Logout by revoking refresh tokens 

1.To install the needed dependencies.
`npm i`


2.To start the server `npm run dev` (app will listen on `port 9000`)

3.Explore the routes in the `requests.rest` file.

4.access tokens are set to expire every `50 seconds` so you will need to claim a new refresh token using the `/retoken` route.

5..You will need to copy and paste the newly generated refresh tokens on the `Header bearer` section every 50 seconds inorder to continue making request to the server. 

6.Once you hit the `/logout` route the refresh token will be revoked(the refresh tooken will no longer generate new token until you login agin) .
