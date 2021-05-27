# Angular Build &amp; Deployment Guide

To start off we will be needing a Virtual Machine (VM) of at least 1 core processor and 4 GB memory with Red Hat OS installed. Please follow the following steps after the pre-requisites are met.

- *Install GIT* 
  - yum update 
  - yum install git 
  - git --version

- *Install Docker* 
  - yum install docker 
  - docker --version 
  
- *Install nodejs* – To build the angular code using angular cli that runs on node
  - yum install rh-nodejs8 
  - scl enable rh-nodejs8 bash (to add node.js to environment)
  - node --version 
  
- *Install angular cli* 
  - npm install -g @angular/cli 
  - ng --version 

- *Check out the source code from GIT* 
  - git clone https://github.com/mosip/mosip-ref-impl.git
  - Navigate to the pre-registration-ui directory inside the cloned repository. Then run the following command in that directory
  - In angular.json file, update the "outputPath" from "dist/pre-registration" to "dist/pre-registration-ui"

  
- *Build the docker image* 
  - ng build --prod --base-href 
  - docker build -t "image-name"
  
- *Run the docker image* 
  - docker run –d –p 80:80 -name nginx "image-name" 

- Go to http://localhost:8080/pre-registration-ui/#/eng
