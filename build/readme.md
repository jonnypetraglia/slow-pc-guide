# Building the Guide #

This guide assumes you have the basics like [Git](https://git-scm.com/) and
[node.js](https://nodejs.org/), installing dependencies via `npm install`, and
that you have a basic knowledge of at least what a "terminal" or "command prompt"
is on your system.


## How to Build ##

Building is done simply by running the command: `npm run build`.

By default it will build all files. You can also pass arguments to build specific items:

  - gh-pages = Create the GitHub pages site
  - skipassets = Skip copying static files like images and stylesheets if building gh-pages
  - md = Create the standalone MarkDown file
  - html = Create the standalone HTML file
  - pdf = Create the PDF document
  - epub = Create the EPUB ebook

So for example, `npm run build gh-pages html pdf` would generate the Github Pages, the HTML file and the PDF file.

There are also some other commands provided for convenience:

  - `npm run website` = equivalent to `npm run build gh-pages`
  - `npm run ebook` = equivalent to `npm run build md html pdf epub`


### Cleaning up ###

The command `npm run clean` will remove all files output by the build process.


## Deploying the web version ##

The deploy.sh shell script is really all you need to push changes to the gh-pages branch.
Really only the author(s) should do this as they are the ones who ultimately decide what the
book should look like, including the web version. (Limiting the people who have access
also cuts down on a lot of confusion.)


If the site is still in early stages -or if the author(s) want a more "rolling release"
style- creating a Git pre-push script with the following might be helpful:

  `npm run build && ./build/deploy.sh`


****************************************

# The Build Methodology #

Here I'll go into how the build method is and why it is that way. For starters:

  * There are basically 2 different builds going on: **gh-pages** and the **ebooks**.
  * The Table of Contents is calculated and spliced in for both types.



## gh-pages ##


gh-pages is really just two parts: rendering & wrapping Markdown into HTML, and copying the assets along with it.

A nav bar is inserted at the top of each page for navigation between sections.

A Github ribbon is inserted because reasons.

All files keep the same base name except 'readme.md' which becomes 'index.md' for obvious reasons.

Self-referencing links have the page they are on prepended.
Each anchor in every file is inspected as it is rendered and the href is altered to include the final filename.
The result is: "#ccleaner" "solutions.html#ccleaner".
(See [the 'Adjust Links' markdown-it plugin](#adjust-links) for more info.)


## ebooks ##

Four varieties of ebooks are produced currently.


**Markdown** is just all the markdown files concatenated together.

**HTML** is essentially just the Markdown from all sections concatenated and then rendered but with several modifications.
Most importantly, all CSS and images are embedded right into the HTML file, 
The size of font in the ToC is altered slightly and the bullets are removed from the section titles.


**PDF** is the HTML version converted to PDF via wkhtmltopdf. It looks pretty much like a printout of the HTML version.


**EPUB** is generated with a package called [ebrew](https://www.npmjs.com/package/ebrew) which has some caveats.
First it requires its input info be read from a JSON file, in this case 'build/meta.json'.
Secondly ebrew bases the paths inside the file on where meta.json is, not the working directory.
Because 'meta.json' belongs in 'build' and the Markdown files belong in the root, this is a problem.
I love having just the filenames inside of meta.json instead of having to prepend them with '../' so the solution was to trick ebrew via changing the method it uses to determine the paths.
Lastly, ebrew reads the files from disk. That means it is acting on pure Markdown, not formatted HTML.


I could gripe more: it inserts a dumb looking front page, it doesn't retrieve images from URLs, and it uses 'marked' to render Markdown instead of  better (IMO) alternatives like remarkable or markdown-it.


****************************************

# What each file does #

## build.js ##

This file is about 1/3 prep, 1/3 helper functions, and 1/3 the actual Promise chain that does the build.


## util.js ##

These are just tiny useful functions that make understanding the code easier.


## markdown-it_plugins.js ##

Some of these build off of other plugins, others are completely new.


### Insert Pagebreak ###

This adds the class "pagebreak" to any set of 2 or more <hr>'s in a row.
We can then use CSS to mark them as a manual pagebreak and then hide them.


### Adjust Image ###

First, it adds a class 'logo' to all images that point to 'logo.png'. This helps a ton with CSS formatting.

Secondly, in the case of an ebook, it will convert all images in the document to base64. Images on the web are even fetched.


### Adjust Links ###

Links to other sections or subsections don't work out of the box if they are cross-page.
Clicking a link to '#fragmentation' in 'Solutions' will do nothing if that header is inside 'Common Causes'.
The end result is 'common_causes.html#fragmentation'.

As each Markdown file is read, it has its Table of Contents parsed and then each entry is associated with the file it came out of via `TocIndex`.
When a link is rendered, the filename is retrieved and prepended. It's that simple.


## Adjust Permalinks ##

There's a nice plugin called [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor).
It adds both an id and a permalink anchor to each header. For example:

    <h1>I like chocolate</h1>

    becomes

    <h1 id="i-like-chocolate">
      I like chocolate
      <a href="#i-like-chocolate">
        #
      </a>
    </h1>

The custom plugin takes this principle and tweaks it.

First, it skips the very first heading on the page and instead adds the class "page-title" to it.
The class makes for easy CSS styling and having a permalink icon at the title at the top of the page looks weird.

Second, adds a 'title' CSS property to let people know that it is a permalink if they hover over it.

Third, it solves the problem of doing a "Bookmark this link" on a permalink giving a bookmark with the title '#'.
Instead we want the name of the section (and the site title). The end result would be:


    <h1 id="i-like-chocolate">
      I like chocolate
      <a href="#i-like-chocolate">
        #
        <span style="display:none">
          I like chocolate - Site title
        <span>
      </a>
    </h1>


The only downside to this is that if CSS is disabled, it becomes incredibly ugly.
Maybe a TODO to fix.