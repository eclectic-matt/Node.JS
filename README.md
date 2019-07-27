# Node.JS
Node.JS projects, folders and notes

## Basic Setup Guide
To set up a Node.JS project, you just need to follow the steps listed on this page. 

This assumes you have Node installed on your machine, which can be downloaded from [the Node.JS website](https://nodejs.org/en/).

### Create a folder to hold the project
Either create a folder in the explorer window, or using command prompt this can be achieved with the following command:

    mkdir your-project-name
    
Then ensure you have moved into this directory using:

    cd your-project-name

### Create your index/start file
Make a file which will be the start point (index) for your Node.JS project. 

This will be referenced in the following step (NPM init) and can be created in the explorer window or using command prompt:

    touch index.js

### Prepare with NPM
Set the project up with NPM (Node Package Manager) so that dependencies are tracked and the project can be shared easily. 
 
Use the following command:
 
    npm init
     
Follow the prompts to give the project a name, description and entry point (e.g. index.js)
 
### (Optional) Install dependencies
There are two ways to install dependencies. Either manually/individually installing these via commands, or by adding the required dependencies to the package.json file. 

For this example, we will be installing the "express" and the "socket.io" modules for this project.

To handle this via the command prompt, which will also add these to dependencies to the package.json file, use the following commands:

    npm install express
    npm install socket.io
    
To handle this by amending the package.json file, edit the file to include the dependencies:

    "express": "*",
    "socket.io": "*"
    
In the above case, the version of the modules being installed is "*" or just by using the latest version. After amending the package.json file, use the following command:

    npm install
    
### (Optional) Exclude node_modules from Git
When using Git Version control, the package can be rebuilt quickly including all dependencies using the commands shown above. 

As such, there is no need to version control the files in the node_modules folder (where the actual dependency files are saved). 

You can therefore add a file called ".gitignore" which has a single line in it "node_modules".

### Run the project (serve)
Once your project is set up and ready to run, then test it out using the following command:

    node index.js
    
Where "index.js" is the name of the entry point file for your project.
