Brief: Cloudflare workers, Wrangler, and RedwoodSDK
Writer: James
Customer: Ritza, maybe RedwoodSDK
Redwoodsdk is a framework that isn’t a framework (?) https://rwsdk.com.

It’s built on https://developers.cloudflare.com/workers/wrangler/ which is a CLI to manage

https://workers.cloudflare.com

I ran through the Redwood quicksatrt guide https://docs.rwsdk.com/getting-started/quick-start/ and it worked, but I wasn’t that clear on what Redwood was doing vs just cloudlfare workers as it all seemed to be wrangler/worker stuff to me.

They also have a more detailed guide https://docs.rwsdk.com/tutorial/full-stack-app/ for a full stack project, but it also doesn’t really show me the avlue of Redwood up front.

I think we should build a set of three guides that show

How to build a full stack app with React and Express and Postgres (traditional full stack app)
How to build the same app using Cloudflare workers and Wrangler (serverless full stack app, probably with D2 as a database or something)
How to build the same app using RedwoodSDK
At that point we’d probably have a good understanding of the problem redwood is solving, and how much simpler it is to use it vs building without it. We could then write the introduction that explains the problems with normal full stack dev, and how cloudflare workers solve that. Then introduce the problems with cloudflare workers and wrangler and how redwood solves that.

Steps
Run through the redwood tutorial
Build a similar but probably simpler app with just Express, React, Postgres
Build it again with Cloudflare workers and Wrangler
Build it again with Redwood
Let’s discuss the three platforms and an angle before you write the guide



discussion since this brief:

Hi everyone, I have made 3 simple apps for the Cloudflare + Redwood brief. I am just making some additions to each so I can try to understand more of the capabilities and advantages of Cloudflare + Redwood over React, Express and Postgres etc
Hoping to chat with @Gareth Dwyer today about an angle for a guide




17 replies


Gareth Dwyer
  Thursday at 10:14 AM
sounds good, are you seeing the value of Redwood or not really?


James Daniel Whitford
  Thursday at 10:49 AM
Yes, it streamlines the Cloudflare config. And it uses React-based abstractions for Cloudflare Workers.
I think this is a good example of their React-based Cloudflare abstractions:
There is this abstraction that lets you create real-time applications using React server components that are using an abstraction of Cloudflare Durable Objects.
You create a key (a room/id) that groups clients in a worker config file, Redwood automatically wires it up with Durable Object, WebSocket handling.
When clients are in the same "room" and they update the state, the server component re-renders and all the connected clients get updated.
And the automatic Cloudflare config provides:
Batteries included setup (D1, R2, Queues),  and the dev has easy access to editing these configs.
Local dev environment automatically configured to match production
Deployment from the command line
CI/CD setup by default
Passkey Auth abstraction is really simple


Gareth Dwyer
  Thursday at 10:51 AM
Cool
10:51
Possible to make it problem based instead of solution based?
10:52
So showing how to build that without redwood and then why it's difficult and then showing the redwood version
10:52
Can skip the non cloudflare version if that's too much for one article and just go from wrangler to redwood maybe?


James Daniel Whitford
  Thursday at 10:56 AM
Yeah definitely. Let me have a quick think about what problem would be the most meaningful to try and solve.
10:57
This is not super relevant but the Redwood philosophy copy just made me think about this section of this talk


Gareth Dwyer
  Thursday at 10:57 AM
Maybe just a basic chatroom like example with a typing or online indicator
10:58
Or I've often seen a live voting app used to demo live features, where people can vote eg dog or cat and then the admin/creator can see the numbers changing live as people vote


James Daniel Whitford
  Thursday at 11:07 AM
Okay cool I will try the live voting app out. So the problems we are addressing are Cloudflare config, auth boilerplate, realtime boilerplate


Gareth Dwyer
  Thursday at 11:14 AM
Sounds good to me


James Daniel Whitford
  Thursday at 11:36 AM
I see Redwood demonstrate a live voting app on this page, not sure if that means we should try a different app
11:37
They don't show how to create it


Gareth Dwyer
  Thursday at 11:37 AM
I think it's ok to copy that if the guide has a different goal
11:37
That one to learn redwood
11:37
The one you do is more to show the value so it can be less detailed




My thoughts now:

Seems like its just one guide now not a set of three