#VidsJS

##0.3.1

###Back-End
- [ ] Add functionality to add app as an os service
- [x] Fix range bug in view
- [ ] Fix rescan bug when some items are deleted before scan
- [x] Add session support
- [x] Add Login with password
- [x] Add Login without password
- [ ] Add support for sequelstore-connect
- [x] Fixed not being able to watch videos after adding login support

###Front-End
- [x] Login form with password
- [x] Login form without password


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