# Major Todo

This is a collection/list of all functions/methods of the Backend API, with their status of completion listed.

🏁 : Finished
⚒ : In Progress, or partially completed
🆘 : Hasn't been started.

### Main.js

* GET /api/packages : ⚒
* POST /api/packages : ⚒
* GET /api/packages/search : 🆘
* GET /api/packages/:packageName : 🏁
* DELETE /api/packages/:packageName : 🆘
* POST /api/packages/:packageName/star : ⚒
* DELETE /api/packages/:packageName/star : 🆘
* GET /api/packages/:packageName/stargazers : 🏁
* POST /api/packages/:packageName/versions : 🆘
* GET /api/packages/:packageName/versions/:versionName : 🆘
* DELETE /api/packages/:packageName/versions/:versionName : 🆘
* GET /api/users/:login/stars : 🏁
* GET /api/stars : 🏁
* GET /api/updates : 🆘

### Query.js

* page(): ⚒
* sort(): 🏁
* dir(): 🏁
* query(): ⚒
* engine(): 🏁
* repo(): ⚒
* tag(): 🏁
* rename(): 🏁

### Collection.js

* Sort(): ⚒
* Direction(): 🏁
* Prune(): ⚒
* EngineFilter(): 🆘
* PackageStats(): 🆘

### Users.js

* VerifyAuth(): 🏁
* GetUser(): 🏁
* Prune(): ⚒

### Data.js

* GetUsers(): 🏁
* SetUsers(): 🆘
* GetPackagePointer(): 🏁
* SetPackagePointer(): 🆘
* GetPackageByID(): 🏁
* GetPackageByName(): 🏁
* GetAllPackages(): 🏁
* GetPackageCollection(): 🏁
* SetPackage(): 🆘
* NewPackage(): 🆘

### Logger.js

* HTTPLog(): 🏁
* ErrorLog(): 🏁
* WarningLog(): 🏁
* InfoLog(): 🏁