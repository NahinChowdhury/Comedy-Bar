# Comedy-Bar
 Just a template for future react works
Plan is to create an app where users can post normal status and also livestream where other users can join the stream.
Kind of a blend between Facebook and Twitch

Will add chat feature afterwards. Users can add friends later on

Thinking of creating a music promotion site instead. Users can publish their songs in the form of posts.
Other users get those posts recommended to them in their news feed. If they start their song, a bar pops up in the bottom like spotify or yt music.
They can jump to new songs and each song will have a link to the user's profile or the post.

Another feature could be a search engine that pulls songs from yt and spotify for now and let's you create a playlist that links to original 
We will expand the post feature by allowing user to attach images, songs, videos or even files. No limit on the number of attachments for now.


STEPS to make sure data is consistent:
In the frontend, make sure all the data you are sending to backend is of correct format
In the backend controller, check that you have all the necessary data to pass to model. I you are updating a post, check by making request to the backend model that the post exists before attempting to update it.(This step can be passed over the model but make sure to do the checks before making db calls)
In the model, the data being passed should be good, so you can run the query and send back results