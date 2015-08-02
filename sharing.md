# Sharing #

## License ##

This guide it is released under _CC BY-NC-SA v4.0_.
What does that mean to the layman?

_CC_ = "Creative Commons".
A group of licenses aimed at promoting sharing and creativity.

_BY_ = "Attribution".
Give credit for this guide to its creator(s) and contributor(s).

_NC_ = "NonCommercial".
Don't use this guide for commercial purposes.

_SA_ = "ShareAlike".
If you want to edit this guide or build upon it, go ahead. But if you do, the end result must also be under this license.

So the longwinded name of the license is:
_Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International_.


## Contributing ##

I would be _elated_ if people wanted to share their knowledge and help expanding this guide. The goal is not to show off what I know, it is to be as helpful as possible.

To contribute, you can just submit a pull request, add an issue, or if you don't know how to do those things: _email me_!

If you contribute, I will add your handle to "Contributors" (unless you don't want me to). If you want to become a co-author, you have to _ask_, as well as providing a decent amount of contributions and committing (pardon the pun) to do things like answer issues....things an author does more than just add content.

I would request that you _please_ consider contributing or co-authoring before forking (covered below). The point of this guide is to share knowledge. Having multiple versions doesn't ensure that people reading it will get all of it. At the very least, there is no harm in asking/suggesting. If we disagree, then by all means, fork away.

### Guidelines ###

If you decide to contribute, understanding these guidelines will make it easier on everyone.

__Do not speak in first person.__
No "I", mostly because this guide is/can be written by multiple people. It also wants to try to be objective when possible and making sure it is clear that subjectivity is clearly stated. So "There are cases when" rather than "From my experience".

__Ensure each heading is unique.__
Each heading receives a permalink that is based on its text (so "CCleaner" becomes "#ccleaner"). Obviously two sections can't share the same permalink so make new ones different. If you truly think that your new section is more logical to have that name than the existing one, the old one can be changed but this should be avoided as it will confuse people who may have boomarked the permalink pointing to the old location.

__Build after your changes before you submit them.__
Building is very automated as long as you have the right tools involved. Unfortunately instructions on getting those set up is beyond the scope of this guide here, but you basically just have to set up [node.js](https://nodejs.org/) and [wkhtmltopdf](http://wkhtmltopdf.org/) and then just run `npm run build` any time you want to rebuild the files

__Do not submit changes to the `gh_pages` branch.__
Let's just make it simple and say that only the person merging the changes will run the official build.


## Forks ##

If you've read the last paragraph of the [Contributing](#contributing) section and you _still_ want to fork, make sure you follow the license's requirements.

For attribution, just add a block at the beginning of this document for your own version stuff, but leave all the blocks that are already there! You can separate them with a header like "Based on:"

Example:

    # robert_paulson's solutions for a slow PC #
    
        Version: 0.3
        Date: TBA
        Author: robert_paulson
        Contributors: Tyler Durden <tyler.durden@fightclub.me>
        Copyright: 2015 Robert Paulson
    
    #### Based on ####
    
        Version: 0.1
        Date: TBA
        Author: notbryant <notbryant@gmail.com>
        Contributors: N/A
        Copyright: 2015 Jon Petraglia

If the guide you are modifying is a modification itself, there will already be a "Based on" section, so just move the current block (robert_paulson's) beneath the "Based on" header like so (abbreviated):

    # title thing
    
        ...
        Author: smith_smithers
        ...
        
    #### Based on ####
    
        ...
        Author: robert_paulson
        ...
        
        ...
        Author: notbryant
        ...
        

Lastly, remember that the "NoCommercial" clause applies to any derivitive works as well.