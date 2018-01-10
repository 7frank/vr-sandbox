in the current configuration the bui

## steps and issues to deploy and run viathe heroku-cli
* navigate to the project directory
    * cd <project-directory>
* upload and install
    * git push heroku master (a)
    *problem is that "npm run build" is not triggered by default and that "npm run heroku-prebuild" did not have the effect estimated
    
* heroku open (b)
* spawn locally
* heroku local web
* heroku logs --tail
* heroku ps

* spawn a bash on the remote server for additional config or error tracking 
    * heroku run bash 
    
* NOTE: use CI to create build artifacts in the near future
    * for now, deleting "dist/.gitignore" and commiting the content of the "dist" folder followed by the commands (a) and (b) will deploy and start the app 
     