# Common Causes #

## High Resource Usage ##

When I refer to "resources" in this guide, I usually mean "CPU and RAM".

For the non-tech savvy, I'll give two brief analogies to explain why they are so important.

"CPU" or "processor" is like the brain of the PC, but more specifically, it is a "train of thought". A PC can only think about 1 or 2 (or nowadays, 4 or even 8) things at a time, so if you have a lot of things going at the same time, it constantly has to switch between them.

"RAM" or "memory" is like a desk. It's where you can spread out the various things you are working on. You need enough desk space to work on all the things you have going on at the moment. If it gets too cluttered or full, the PC has to move stuff around on the desk to get enough room to finish a task.

With those cheesy analogies, hopefully you see why I sometimes refer to them as "precious resources".

## Insufficient Memory ##

I already talked about memory in [Resource Usage](#resource-usage), but there _are_ cases when the amount of RAM you have in your machine is simply insufficient for the task at hand.

This slows down the computer because Windows uses a tactic called "virtual memory", where it treats a part of the hard drive (called the "pagefile") as if it were memory. The purpose is to move contents of RAM that haven't been used recently into the pagefile so that it can use the real memory space for stuff you _are_ using. (To extend the analogy from before, it's like putting stuff on the desk that you don't currently need on the floor.)

Now Hard Drives are _much_ slower than RAM, but that doesn't matter if its stuff you aren't using currently. But if you don't have _enough_ RAM, then it has to move stuff that you are _currently using_ to the pagefile, meaning that you are now using the super slow Hard Drive for your work instead of your RAM.

As with drive space, I should be clear: _"more memory" =/= "faster PC"_, with one caveat. 

![TODO: disk cache](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)

## Full Drive ##

Whether or not having a full drive _directly_ causes a performance drop is not clear to me; my thought is no for Hard Drives (HDDs), yes for Solid State Drives (SSDs).

Regardless, it's good sense to try to keep a decent amount free, because:

  - A fuller disk will become [fragmented](#fragmented-hard-drive) much quicker
  - [Defragmenting](#defragment) requires free space to work
  - A lot of programs require temporary space to function
  - You don't want to run out of space while doing something like recording video or audio.
  - _I think_ that a full drive will provide less chance to restore deleted files since they will be overwritten sooner.

With that said, I want to make clear that _"more free space" =/= "faster PC"_. A drive that is 20% full will not inherantly perform better than a drive that is 50% full. It's about keeping it from being _too_ full, not from using as little space as possible.

For SSDs, 75% full seems to be the common trend for an upper limit.
For HDDs, I aim for 10GB, but that's entirely subjective.



## Fragmented Hard Drive ##

Ideally, files are written to disk from start to finish. But over time (in Windows), when you delete files, you leave "holes" where they used to be, of varying sizes. Later files can be split into smaller parts to be put into whatever holes exist so that the space isn't wasted. This is what a fragmented file is: a file that has been split into parts which have been put on different places on the drive.

The reason this becomes problematic is that hard drives have an arm that actually moves back and forth across the drive. If a file is split into parts and the parts are not close together, it takes a lot of time for the arm to move around to grab them all.

The solution is called "Defragmenting", which is exactly what it sounds like: removing fragments. It moves the parts of the files around to try to get them next together so the arm doesn't have to move around.

For those that like analogies, imagine a book that has been cut up into chapters and the chapters have been scattered in a row of bookshelves. Every time you finish reading a chapter, you have to walk over to where the next chapter is, read it, then repeat. Defragmenting is finding all of the chapters, sticking them together, and finding a new space on the bookshelf where they can fit.


Also, a quick note: defragmenting is for Hard Drives only. __Do not defragment a Solid State Drive (SSD)__. They don't need it because they have no moving arm, hence "solid state".
  
## Malware ##

Malware (i.e. malicious software) can slow your machine significantly. Though all malware is bad, _spyware_ is the most worst for performance because it uses your precious system resources to track you.

It should be said though that "virus" tends to be the scapegoat for any and all computer problems. In my personal experience, a slow machine is rarely caused by malware and if it is, it will be obvious. Nonetheless, no malware is good malware so checking for it is never a bad thing.

## Hardware Failure ##

Hardware does fail....but not often, unless the machine is either really new or really ancient. That's why I put it more towards the end of this guide.

But they don't always just die, they sometimes start to slowly fail which can cause havoc.

The two that I tend to test for are __RAM__ and __Hard Drive__.

For RAM, there is a very well known and well tested program called Memtest86.

Hard Drives are a bit trickier; they have what is known as S.M.A.R.T. (Self-Monitoring, Analysis and Reporting Technology), but it can be difficult to read.

![TODO: more on HDD failure](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)

## Running Hot ##

Get ready for a little physics. I'll make it short and easy, I promise.

    First, you need to know that "temperature" (or really "hot") is just atoms moving around randomly, even solids. In physics terms, the energy that is contained inside "things moving" is called "kinetic energy". So if something is hot, that is a result of its atoms containing a lot of kinetic energy- they're bouncing around like crazy. Still with me?
    
    Electricity (simplified) is electrons moving through stuff, i.e. electrons with kinetic energy. When electricity tries to travel through anything (be it a wire or a processor), the electrons that are moving bump into the atoms of whatever it is moving through. This bumping is known as 'resistance'. When they bump, the electron loses some of its kinetic energy to the atom.
    
    And what happens if the atom gains kinetic energy? It gets hotter. That's why a wire gets hot when you run an electric current through it.
    
    What's so bad about a hot wire? Well, 
   
    
    One step further: more kinetic energy means faster moving, so the atom will start to bounce around even more. It bouncing around more means that it will collide with even more electrons, which will start the whole cycle all over again.
    
    What's 
    

![TODO: more on physics & double check correctness](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)

    
tl;dr: HEAT BAD. FIRE BAD! FIRE BAD!

The solution is called a Heat Sink which is made of metal and directly touches the component (such as the CPU) which allows for a place for the heat to easily move to. Heat Sinks are usually designed to have a large surface area so that it can dissipate as much heat as possible into the air. This system tends to work pretty well, but problems can occur at different parts of the process:

![TODO: refine heat sink talk](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)

**Dust**: Dust collecting near the fans or Heat Sinks makes it where heat can't be absorbed as easily by the air. Desktops tend to collect more dust than Laptops since they are stationary and have more areas for dust to collect, but both are susceptible to running hotter by dust

**Bad thermal paste**: "Thermal Paste" is used to fill the microscopic gaps between a CPU and its heat sink because the paste dissipates heat much better than air. Poor quality thermal paste, or thermal paste that has dried out over the years, can contribute to heat being dissipated poorly which results in an increase in temperature. Both Desktops and Laptops are susceptible to this but with one key difference: Laptops often use "Thermal Pads" which work less efficiently. It is _possible_ to replace a Pad with Paste, but you have to make sure that heatsink will fit _tightly_ onto the CPU's top. Air between the Paste and the heatsink may end out being worse than the Pad.

**Poor airflow**: Airflow inside the case is critical, both in dissipating heat from a heat sink and also moving hot air out of the case and fresh air in. Having enough fans is crucial, both intake and exhaust, as is the quality of the fan in terms of how much air they push measured in CFM (Cubit Feet per Minute). Lastly, good cable management is important to make sure that air can flow freely from the intake (front) to the exhaust (back) of the case. Good cases are designed with all these things in mind, including enough good quality fans and utilities to keep cables out of the way.

** Poor ventilation**: Ventilation (moving air in and out of the case) directly effects airflow inside the case; if fans can't pull fresh air in or push hot air out, it's going to build up regardless of how well it flows. The first step is ensuring that the intake/outake fans are not blocked. For desktops, the intake tends to be in the front and the exhaust in the back so leave enough space in front of and behind the case and ensure that any air coming out can flow freely away from the case. Laptops vary but often the intake is on the bottom which can be a real problem; hard surfaces are usually ok due to the rubber feet, but soft surfaces like clothes or a bed can completely suffocate the intake.


![TODO: more on poor ventilation](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)

I should also say that running hot is __never__ good even if it doesn't cause poor performance. For example, in Desktops, the Power Supply Unit also tends to accumulate dust and while it may not slow things down....well, you just don't want the thing that is responsible for maintaining hundreds of volts to get too hot. (Spoilers: Fire. FIRE BAD! FIRE BAD!)


## Bizarre Failures ##

Filesystem errors = chkdsk
Graphics card errors = reinstall



![TODO: "Insufficient Memory" disk cache](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)