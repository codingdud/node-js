api design principle that use rest architecture
representational state transfer

what is api? 
application prgram interface that help comunication between two services like backend->frontend, databae->backend

six rest principle or architecture constrains

1. uniform insterface
-  Self-descriptive messages: Each message includes enough information to describe how to process it.
- Resource identification: URLs uniquely identify resources.
- Manipulation of resources through representations
- for same resource same api request
- resource should catain pice of inforamtion that client need

2. client-server - decopling cliend and server | server and client must completle independent
client must only know url of server
server should not modify client application other that pasing req data

3. REST API are stateless
- each request is independent and shouldnt dependend on other request
- that mean each request should mention all info that are required
- no session required
- no client request data on server

4. cacheability 
- resource should be cachable to client or server
- server respones also catain caching info
- whearther it alowed or not

5. layer system architecture
- client not server should know the wheather the comunication initialte from application end or intermediate
- eg: midleware authrization,json,api, api route

6. code on demand(optinal)
- api respones are mostly static resource but some time it code\
- in that senario we should exute code on demand


7. http methods
- get : get a resource
- post : send data to server
- put : update data with new data
- patch : update existing data
- delete : delete a resource


