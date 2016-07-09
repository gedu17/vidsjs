#VidsJS

##0.3.3
###Back-End
- [x] Ability to move items and folders

###Front-End
- [x] Ability to move items and folders
- [x] New template for user selection
- [x] New template for user login

##0.3.2

###Back-End
- [x] Ability to create virtual folders
- [x] Ability to flag item as seen, deleted
- [x] Ability to change item name
- [x] Fix incorrect id in virtual view
- [x] Change isSeen method to isSeenOrDeleted in utils

###Front-End
- [x] Ability to create virtual folders
- [x] Ability to flag item as seen, deleted
- [x] Ability to change item name
- [x] Add Bootstrap
- [x] Add jQuery

##0.3.1

###Back-End
- [x] Fix range bug in view
- [x] Fix rescan bug when some items are deleted before scan
- [x] Add session support
- [x] Add Login with password
- [x] Add Login without password
- [x] Add support for connect-session-sequelize
- [x] Fix not being able to watch videos after adding login support
- [x] Add users_settings table to store various information
- [x] Add multiple scan directory functionality
- [x] Remove scanned entries from database file commited to repo
- [x] Fix a bug with users_data table column mismatch

###Front-End
- [x] Login form with password
- [x] Login form without password
- [x] Differenciate content by base dir
- [x] Add Virtual listing
- [x] Add Seen listing


##0.3

###Back-End
- [x] create user table in sqlite
- [x] create user_data table (save video data (customised name, seen, etc)) in sqlite
- [x] fixed bug in removing found videos after dirscan
- [x] ability to flag item as seen
- [x] view method to return partial content
- [x] refactored code to modules
- [x] fixed bug in compareDirListing

###Front-End
- [x] ability to flag as seen
- [x] physical video list

##0.2

###Back-End

- [x] Read dir tree
- [x] Add/refresh dir tree to db
- [x] sqlite support
- [x] create videos table in sqlite
- [x] create virtual directories table in sqlite
- [x] remove not found videos after dirscan

###Front-End