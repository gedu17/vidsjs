#VidsJS

##0.3.7
###Back-End
- [ ] Add all errors to system_messages
- [ ] Add setting to add/edit/delete user directories
- [ ] Add setting to change user password
- [ ] Add setting to disable password checking
- [ ] Add setting to create user
- [ ] Add messages to system_messages when deleting or adding items


###Front-End
- [ ] Add modal open when opening video for view, when returned after the video to tag as seen, rate video, maybe some social buttons
- [ ] Add settings page
- [ ] Validate input from front-end script (folder name etc)

##0.3.6
###Back-End
- [x] Add support to serve subtitles with the same name as video but different extension
- [x] Fix various bugs in generateVirtualViewUrl and generatePhysicalViewUrl 
- [x] Fix various bugs in virtualView and PhysicalView
- [x] Fix wrong column name in readdir
- [x] Add support for subtitle types: srt, ssa, ass, smi, sub, idx, mpl, vtt, psb, sami, pjs

##0.3.5
###Back-End
- [x] Add default settings checker and installer
- [x] Change virtual view url scheme to /view/:id/:name.:format
- [x] Change physical view url scheme to /pview/:id/:name.:format
- [x] Add extension to every video link and recognise that in view
- [x] Remove subrip column
- [x] Move password hashing function from users module to utils module
- [x] Change loginrequired setting name to loginmethod
- [x] Add Setup page for new installs
- [x] Fix database table and column names
- [x] Add table for items mime types

##0.3.4
###Back-End
- [x] Rename users_data columns
- [x] Change file extension detection in favor of mime types
- [x] Remove Filetypes row from settings table
- [x] Add support for srt file scanning
- [x] Add system_messages table

###Front-End
- [x] Update physical view template to match virtual view

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
