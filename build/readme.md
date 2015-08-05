# Building the Guide #

This guide assumes you have the basics like [Git](https://git-scm.com/) and
[node.js](https://nodejs.org/), installing dependencies via `npm install`, and
that you have a basic knowledge of at least what a "terminal" or "command prompt"
is on your system.


## How to Build ##

Building is done simply by running the command: `npm run build`.

By default it will build all files. You can also pass arguments to build specific items:

  - gh_pages = Create the GitHub pages site
  - skipassets = Skip copying static files like images and stylesheets if building gh_pages
  - md = Create the standalone MarkDown file
  - html = Create the standalone HTML file
  - pdf = Create the 
  - epub

So for example, `npm run build gh_pages html pdf` would generate the Github Pages, the HTML file and the PDF file.

There are also some other commands provided for convenience:

  - `npm run website` = equivalent to `npm run build gh_pages`
  - `npm run ebook` = equivalent to `npm run build md html pdf epub`


### Cleaning up ###

The command `npm run clean` will remove all files output by the build process.


## Deploying the web version ##

The deploy.sh shell script is really all you need to push changes to the gh_pages branch.
Really only the author(s) should do this as they are the ones who ultimately decide what the
book should look like, including the web version. (Limiting the people who have access
also cuts down on a lot of confusion.)


If the site is still in early stages -or if the author(s) want a more "rolling release"
style- creating a Git pre-push script with the following might be helpful:

  `npm run build && ./build/deploy.sh`


****************************************

# The Build Methodology #

Here I'll go into how the build method is and why it is that way. For starters:

  * There are basically 2 different builds going on: **gh_pages** and the **ebooks**.
  * The Table of Contents is calculated and spliced in for both types.



## gh_pages ##


gh_pages is really just two parts: rendering & wrapping Markdown into HTML, and copying the assets along with it.

A nav bar is inserted at the top of each page for navigation between sections.

A Github ribbon is inserted because reasons.

All files keep the same base name except 'readme.md' which becomes 'index.md' for obvious reasons.

Self-referencing links have the page they are on prepended.
Each anchor in every file is inspected as it is rendered and the href is altered to include the final filename.
The result is: "#ccleaner" "solutions.html#ccleaner".
(See [the 'Adjust Links' markdown-it plugin](#adjust-links) for more info.)


## ebooks ##

Four varieties of ebooks are produced currently: markdown, html, pdf and epub.

  - markdown = all the markdown files concatenated together
  - html = a 'standalone' aggregate version of gh_pages; assets like images and stylesheets and embedded right into the file
  - pdf = created by [wkhtmltopdf](http://wkhtmltopdf.org/) which renders using WebKit
  - epub = created by ebrew, a nodejs package just for that purpose;

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


I could gripe more: it inserts a dumb looking front page, it doesn't retrieve images from URLs, and it uses 'marked' which doesn't render as nice as others like remarkable or markdown-it.

****************************************

# markdown-it plugins and why #

Here are the plugins written, what they do and why.

## Insert Pagebreak ##

Obviously having the ability to do a manual pagebreak is nice.

This adds the class "pagebreak" to any set of 2 or more <hr>'s in a row.
We can then use CSS to mark them as a manual pagebreak and then hide them.


## Adjust Image ##

First, it adds a class 'logo' to all images that point to 'logo.png'. This helps a ton with CSS formatting.

Secondly, in the case of an ebook, it will convert all images in the document to base64. Images on the web are even fetched.


## Adjust Links ##

Links to other sections or subsections don't work out of the box if they are cross-page.
Clicking a link to '#fragmentation' in 'Solutions' will do nothing if that header is inside 'Common Causes'.
The result is altering it to 'common_causes.html#fragmentation'.

Basically, when each file is read a Table of Contents is generated and then iterated.
A hash ('TocHash') is made mapping from the slug to its file (e.g. 'ccleaner' => 'solutions.md') which is populated when each file is read.
When an anchor is being rendered, it is looked up in the hash and the filename is then used to correct the link.


## Adjust Permalinks ##

There's a nice plugin called [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor). It adds both an id and a permalink anchor to each header. For example:

    <h1>I like chocolate</h1>

    becomes

    <h1 id="i-like-chocolate">I like chocolate <a href="#i-like-chocolate">#</a></h1>

The custom plugin takes this principle and tweaks it.

First, it skips the very first heading on the page and instead adds the class "page-title" to it.

Second, adds a 'title' CSS property to let people know that it is a permalink if they hover

Third, it makes it where bookmarking the link will give it a nice title by adding hidden text inside the link.
Normally if you right click a permalink and do "Bookmark this link", the title will be simply '#'. This is not ideal.
The solution is to insert a hidden <span> inside the <a> that contains the text we want the bookmark title to be.
Like so:



  <h1 id="i-like-chocolate">
    I like chocolate
    <a href="#i-like-chocolate">
      #
      <span style="display:none">
        I like chocolate - Site title
      <span>
    </a>
  </h1>


It's hidden but the browser still uses it when bookmarking.

The only downside to this is that if CSS is turned off, it becomes ugly and displays as:

  I like chocolate I like chocolate - Site title

So that's something to think about....TODO maybe?