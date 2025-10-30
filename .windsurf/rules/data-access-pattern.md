---
trigger: model_decision
description: Apply this rule when creating/updating CRUD methods for data access
---

The pattern that I follow in this project is:
Server actions -> db data CRUD
hooks: call server actions through tanstack query (query/mutation) under appropriate query key
prefetch: IF possible, prefetch the data serverside and hydrate the client side

Can you make sure to follow this pattern is your last edits as well. Create the hooks which call the server actions you created. Dont call server actions directly in client/server components. Calling via hooks using tanstack query will ensure caching and data invalidation etc. 

Also look for parallelizing calls  whenever possible to increse performance and decrease fetching time. also strive to reuse already fetched data by using useQuery