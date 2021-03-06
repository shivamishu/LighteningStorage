# LightningStorage 
- File storage application on Cloud
https://www.mylightningstorage.com    

This app allows you to manage your files hosted on AWS.  
LightningStorage, is a web application compatible on all devices(mobile, tablets, laptops, desktops etc) hosted 100% on AWS cloud. It handles authorization using AWS resources and Facebook, thus, allows only authorized users to maintain their own files securely on AWS cloud.  
It uses various AWS resources like AWS S3, DynamoDB, CloudFront, Cognito, EC2, ELB, AutoScaling Group, S3 Transfer Acceleration, Route53, CloudWatch, Lambda, SNS, Cross Region Data Replication etc. The application is highly available, highly scalable and highly durable meeting all AWS standard SLAs. It also applies data archiving and other lifecycle policies. The application is based on free tier provided by AWS and uses AWS resources effectively, thus, its cost effective.  
Technical Stack: NodeJS, AJAX, JavaScript, HTML, CSS, OpenSAPUI5 and AWS Resources.  


# Features
List of all files, Download, Upload, Update and Delete Files  
User’s Full name, email id, File upload date, last change date, file description, file size and download URL
Versioning
Authorized user access.  
Admin Mode  to manage all the files of the users in the user pool.
Custom sign in/sign up using TwoFactor Authentication.
Social Media Integration like Facebook for login purposes.  

# APIs
GET: https://www.mylightningstorage.com/api/read_files  
POST: https://www.mylightningstorage.com/api/upload_file  
UPDATE: https://www.mylightningstorage.com/api/update_file  
DELETE: https://www.mylightningstorage.com/api/delete_file  

# Demo
Demo Video: [Lightning Storage Demo](https://drive.google.com/file/d/1vDODC7B34bSNxCsj3H7KN38I5CwkfXnK/view)  
P.S: If the above google drive video takes a longer time to load, then please download the video to watch it offline.  
Application URL: https://www.mylightningstorage.com  

# Screenshots

Welcome Page  
![aws p1 0](https://user-images.githubusercontent.com/24988178/97101398-216a9900-16c3-11eb-8139-370a9c344eb3.png)

Cognito Sign In/Sign Up  
![AWS P1 1](https://user-images.githubusercontent.com/24988178/97101399-22032f80-16c3-11eb-88ea-ffc21ad7c4df.png)

User Mode  
![AWS P1 - 2](https://user-images.githubusercontent.com/24988178/97101394-1ca5e500-16c3-11eb-817d-d9ef78d6202b.png)

Admin Mode  
![aws p1 admin](https://user-images.githubusercontent.com/24988178/97101400-229bc600-16c3-11eb-97af-1f111140b38c.png)

# AWS Architecture Diagram:  

![Untitled Diagram](https://user-images.githubusercontent.com/24988178/97101260-e451d700-16c1-11eb-90b6-e1cb49d9f984.png)

# Local Setup
Clone the repository and change the directory to server.  
You can create an .env file with all the relevant environment variables and use your own AWS credentials to run the application.  
The application's packages could be installed by running npm i --s  
Run the server: node server.js  
Application is available on the localhost port 3000 or 443.  

# AWS Resources Setup:  
       
•	GitHub: Clone the project from GitHub Repository to EC2.  https://github.com/shivamishu/LighteningStorage   
  
•	EC2: Create the EC2 instance and install NodeJS. Create snapshot, AMI of EC2 instance with all the required configurations. This AMI will be used by EC2 instances when it gets spawned by Auto scaling policies.  
  
•	AutoScaling Group: Configure the required auto scaling policy to make the system highly-available and highly scalable with min desired instance as 1 and max instance of 2. These configs could be changed anytime as per the requirements.  
  
•	Elastic Load Balancer: An Application(HTTP HTTPS) load balancer manages the client traffic efficiently. They distributes incoming application traffic load across multiple EC2 instances hosted in multiple Availability Zones. We can have one or more listeners attached to our load balancer to increase application’s availability.  
  
•	S3: S3 (with Standard S3 storage class) is used to store and manage the files/objects uploaded by our users.  
  
•	S3 - Standard Infrequent Access is used to store objects after 75 days to have faster access of infrequent files.  
  
•	AWS Glacier for S3 bucket: As the content is required only for a year from object’s creation date, so we will move the content to Amazon Glacier (as it is an archival storage for infrequently) after 365 days.  
  
•	Cross Region Data Replication: To implement DR, we have used Data Replication of S3 to have Cross Region Replication accommodating fault tolerance. We could also use Disaster Recovery for fault tolerance.  
  
•	CloudFront: We used Amazon CloudFront to reduce the unnecessary traffic back to S3 origin to help improve latency as well as reduce load on the origin. It caches our content and provides faster access globally.  
  
•	Transfer Acceleration for S3 Bucket: Transfer Acceleration will take advantage of its globally distributed edge locations. When the data arrives at the nearest edge location, it is routed to automatically internally by Amazon S3 over an optimized network path.  
•	DynamoDB: Used DynamoDB instance as the requirement is to have multi AZ deployment, which DynamoDB takes care of automatically. We could have used RDS with Aurora too to achieve this.   
  
•	Route 53:  https://www.mylightningstorage.com. Registered the above domain on Route53 and configured the hosted zones and created records and added record names with various routing policies using dual stack load balancer redirecting all traffic to HTTPS(installed SSL certificates using Certificate Manager).  
  
•	CloudWatch: It is used to log and monitor the auto scaling, EC2, DynamoDB S3 bucket logs etc using Lambda triggers with SNS.  
  
•	Lambda: We invoke a Lambda function whenever a file is deleted from the bucket and log it in CloudWatch using SNS topic.   
  
•	SNS: It is used for sending various above notifications using messages, emails and logs.  
  
•	Amazon Cognito: We have created an user pool for all our users to accommodate the access to application and APIs using Cognito Hosted UI for sing and sign up using 2FA and also added social identity providers like Facebook.  
  
•	Used Open SAP UI5 with bootstrap to build UI. It is an open source Model View Controller based JavaScript Framework to build generic web applications compatible on all devices: Mobile, Tablets, Laptop, Desktop etc. For Backend, we used NodeJS framework integrated with all our AWS resources and other open source libraries.   
  

