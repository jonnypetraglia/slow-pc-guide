# Solutions #

## Freeing Drive Space ##

Doing this section before [Scanning](#scanning) is wise because you can remove junk that does not need to be scanned, which will make the scanning process shorter.

### CCleaner ###

Tools: CCleaner

**Difficulty: EASY**

CCleaner is useful for two things:
  - Cleaning junk files, like temporary files and caches
  - Cleaning unnecessary registry files.

**Why is it needed**

This is mostly to clean unnecessary disk usage; it doesn't necessarily yield a noticable performance increase in and of itself, it's more just something you should do occasionally (like 1x a month) for maintenance.

**Warnings**

Some people say to never use a registry cleaner, that it is does not yield any performance benefits and can cause problems. All that can be offered in retort is anecdotal evidence of many people _never_ encountering a single issue as a result of CCleaner's registry cleaner.

If you _are_ worred about encountering problems, just backup the registry when prompted.

**How to use**

Often clearing the registry will reveal more files that can be removed, and vice versa. So a good strategy is to do the following:

  (a) run the registry cleaner
  (b) run the disk cleaner
  (c) repeat until the neither show any results


### Uninstall ###

Tools: One or more of RevoUninstaller, CCleaner, and builtin "Add/Remove Programs"

**Difficulty: MEDIUM**

Uninstalling unused programs is just good practice, _especially_ for stuff that came bundled with your PC that you never use.

RevoUninstaller has a the awesome functionality of searching around for stuff that the regular uninstaller missed, which makes it the most thorough.

CCleaner also lists programs to uninstall under "Tools", and the built-in uninstaller is also adequate.

You can get by using only one, but for complete thoroughness, use all 3 because some show entries that others miss. I don't know why.

**Why is it needed**

This yields two benefits:
  - frees disk space
  - removes unused programs that may doing things in the background

**Warnings**

You need to know what you are uninstalling before you uninstall it. Most of the time this isn't dangerous to your system, but you can sometimes break the programs that you use by uninstalling something that it depends on. _Most_ things are easily identifiable; when they are not, use Google. If you are ever unsure, hold off, but make note of what you may want to uninstall later on.

**How to use**

RevoUninstaller lets you specify different levels of thoroughness; "Medium" is usually fine. Otherwise, you just uninstall stuff one at a time.

Also, if you uninstall a few things, running [CCleaner](#ccleaner) again might be a wise idea, to pick up any files they left behind. (Even RevoUninstaller misses some occasionally.)


### WinDirStat ###

Tools: WinDirStat

**Difficulty: MEDIUM-HARD**

If your disk is full,  WinDirStat is a nice program that shows you, visually, what is taking up space on your drive. It shows files as pretty boxes and sorts by folders. It's great.

**Why is it needed**

This is mostly for _analysis_ rather than direct problem solving. Its main purpose is to give you insight, because often seeing what takes up a lot of space can hint at what might be using other resources as well. But the main benefit is when your disk is full, or at least fuller than you'd like it to be.

Granted, it does take a bit of familiarity with computers to understand just what you're looking at. Like for example: two common big files ("pagefile.sys" and "hiberfil.sys") are system files that you can't exactly just delete.

**Warnings**

Deleting files from WinDirStat can be somewhat dangerous. If they are personal files that you immediately recognize like downloads or music or movies, that's ok. But for files that are related to programs or to Windows itself, deleting files wantonly is _very_ unwise unless you _really_ know what you are doing. For example: space wasters inside "C:\Program Files" should be [uninstalled](#uninstall) rather than just deleted (though sometimes they shouldn't be uninstalled either).

Best rule of thumb is: __Always know what you are deleting before you delete it__.

**How to use**

After selecting the C: drive, you will have to wait for the little Pacman-esque characters to finish. Then you can click pretty boxes to identify what file it is, or select files in the list to see what boxes they are. Isn't it pretty?

### DoubleKiller ###

Tools: DoubleKiller

**Difficulty: MEDIUM**

_Sometimes_ space is wasted because there are duplicate files laying around. DoubleKiller provides a very easy way to find, identify, and delete duplicate files. This is really only for a very specific case, but it is worth mentioning.

**Why is it needed**

Duplicate files on a PC are not always a bad thing. Duplicate _personal_ files are simply wasted space, as well as clutter.

**Warnings**

One should be wary to only delete extra files that you are sure are not needed. For example, Windows likes to keep backups of core system files, meaning they will be in two or more places. Deleting either the originals or the backups can cause problems.

So my recommendation, again, is to only use it to delete personal files. Music files, pictures, videos, documents, etc.

**How to use**

![TODO: using DoubleKiller](https://d30y9cdsu7xlg0.cloudfront.net/png/42732-200.png)


## Scanning ##

This section contains things that take a _long_ time, so everything in this section can be done __simultaneously__. Basically, watch a movie. I recommend _The Matrix_. That film is classic.

### Defragment ###

Tools: Defraggler, Auslogics Disk Defrag, or builtin "Disk Defragmenter"

**Difficulty: EASY**

**Why is it needed**

What "fragmentation" is and why it's bad is explained in the [Common Causes section](#fragmented-hard-drive).

**Warnings**

Many people online say that you do not need to defragment Windows 7 and 8 because it does it for you. The "warning", then, would be that defragmenting on 7 or 8 works your hard drive needlessly which might shorten its life a little.

This, to me, seems like a misnomer. Windows 7 and Windows 8 _schedule_ defragmentation automatically, but they are not immune to it in the same way that, say, Linux is. And more importantly, they schedule it for a _specific time each week_, usually in the middle of the night. That means that if your computer shuts down every night or goes to sleep (like a laptop), it won't defragment automatically. You can set your own schedule if you are sure that your PC will be on and awake when the scan is supposed to start and _stay_ on for the duration of the scan.

But it never hurts to check. So my logic is: analyze the disk first with a 3rd party defragmenter. If it says it is fragmented, defragment it.

**How to use**

While defragmenting, you can continue to use your computer as normal, and if the process is interrupted, you can just start it again and it will basically pick up where it left off.

### Anti-malware ###

Tools recommended for long-term install:
  - ESET nod32 ($$$)
  - Malwarebytes Anti-Malware (MBAM)
  - Avast
  - Bit Defender
  
Tools recommended just for repair-time scanning:
  - Spybot (for Spyware)
  - Super Antispyware (for Spyware)
  - whatever is already installed

**Difficulty: EASY**

The reasoning behind why malware can slow down your PC is covered in the [Common Causes section](#malware).

**Why is it needed**

It's generally better to scan for malware early on in the repair process, i.e. don't save it toward the end. If the system does have Malware, it's best to get rid of it ASAP so it doesn't have time to do naughty things while you are doing anything else.

The reason it is placed _after_ clearing disk space in this guide is that getting rid of junk data means that's less data then the scanner has to scan, and if you are running multiple scanners, that can reduce the time significantly.

**Warnings**

The only real danger is to make _sure_ that the scanner you are using is legit and is not itself a malware! Posing as a virus scanner is a very common tactic for malware to gain access to your system. So, just _google_ any anti-malware software that you are unsure of.

The only other warning is: make sure only have one anti-malware software installed when you are done with the machine. You can install any scanners you want while in the repairing process, but when you are finished, make sure at most 1 remains. And check the section on [removing anti-malware software](#bloated-anti-malware) to make sure that you do it properly.

**How to use**

Go ahead and feel free to use whatever is installed, including the "bloaty" ones (McAfee, Symantic, Norton, etc).

Also make sure that you scan with at least one of the "good" anti-malware softwares listed at the beginning of this section.

And feel free to let them all run at the same time, even overnight (as long as you set the power preferences to not fall asleep when idle).


## Freeing Resources ##

In this guide, "resources" generally means "CPU and RAM". If you are not tech-savvy, there are some wonderfully cheesy analogies for them in the [Common Causes section](#resource-usage).

### Bloated Anti-malware ###

Tools: ESET AV Remover or vendor-specific removal tool(s)

**Difficulty: EASY**

Many of the big-name anti-malware programs are what is called "bloated" or "bloatware", meaning that they use too much of a system's resources for what they are intended to do. So while malware programs can drain a system's resources, anti-malware can be just as bad in terms of performance.

**Why is it needed**

Even though the intention might be good, if an anti-malware software slows the system down to an unusable point, it is doing more help than harm; what's the point of a secure PC if you can't use it?

What's important to realize is that _simply uninstalling is not enough_. Each big-name anti-malware vendor has their own "removal tool", because even _they_ realize that their product is just dang difficult to get rid of.

**Warnings**

If you are working on someone else's computer, consider it best practice to ask before removing any _paid_ installed anti-malware programs. Often users use these bloaty ones because they come pre-installed when they buy the PC, but still, there's a chance that they actually want it. Even if you think that they are better off getting rid of the bloatware and replacing it with a better (often free) alternative, it's not your choice to make.

**How to use**

Always start with a normal uninstall. See the [Uninstall](#uninstall) section for tips on how. Then, after it finishes (you don't have to reboot after....unless you really want to), run a removal tool.

Thankfully, ESET actually removal tool that removes old anti-malware softwares! It's called [ESET AV Remover](http://help.eset.com/ees/6/en-US/?av_remover.htm)

Or, if you'd prefer to use the vendor's own removal tool, ESET also has a [huge list](http://kb.eset.com/esetkb/index?page=content&id=SOLN146) that makes tracking down the one(s) you need easy.


### Autoruns ###

Tools: Autoruns

**Difficulty: HARD**

Autoruns is a powertool made by Sysinternals, a resource offered by Microsoft (wow, MS actually makes good things every now and then...) that helps you manage things like startup entries, browser helper objects, services, etc. Basically it's a tool for power users.

**Why is it needed**

This is actually _the biggest_ culprit to slow PCs: too many programs run on startup. Not only does this take longer for your computer to boot up, it also (more importantly) means that more processes will be running after the computer has finished booting.

For those reasons, you generally only want to start things on boot that you will _absolutely_ need. Software vendors don't seem to think that way. They tend to think:

    "My tool X is pretty handy to the user, it should be running all the time in case the user needs it. It doesn't use too many resources, the user won't even notice it."

They don't take into consideration that _every other_ software vendor thinks the same thing and the result is that you have two dozen tools that you rarely use running all the time, consuming precious resources.

Additionally, Autoruns lets you tweak a _plethora_ of other options that this guide can't even begin to cover. There are even some that I just don't mess with.

**Warnings**

Now with all this being said, __every entry exists for a reason__. Some reasons are stupid, but some are good and even necessary. Using Autoruns wantonly can really mess things up; from iDevice support, to sound, to your system simply not working. _Nothing is truly safe unless you know exactly what it does._

So my advice is: __Google. Everything.__ Google has the answers to what almost everything in your startup is. It gets much easier over time as you begin to recognize common entries, but until then, just be careful with what you disable. Or don't and just accept that some things (like in my instance, time syncronization) may stop working and be extremely annoying to get working again.

**How to use**

Here's how you should approach using Autoruns:
  - __Use. Google.__ Yes, it takes more time. Yes, it's worth it.
  - Only disable things that you know what they do
  - Use Autorun's handy "Backup" feature before you start
  - If you are new to Autoruns or just want to experiment, disable small amounts at a time, then reboot. Much easier to troubleshoot if something goes wrong


So now, the tabs of Autoruns ordered from "Use" to "Avoid":


  - _Logon_ manages the programs that are run immediately at startup. It is by far the most important.

  - _Sidebar Gadgets_ is an easy target if you don't use desktop Gadgets. And if you are reading this guide, worried about your PC's performance, you _should not be using desktop gadgets_.

  - _Explorer_ deals with Windows Explorer extensions, mostly custom context menus (i.e. right click options).

  - _Internet Explorer_ deals with IE-related extensions and such. But you __should use a better browser than IE__ so )everything on this tab is (usually) unchecked for me.

  - _Scheduled Tasks_ are like "Logon" but they only run once, usually at a specified time other than right after startup. Still, sometimes you can see a lot of scheduled tasks for dumb software that you don't care about (like 5 scheduled tasks for RealPlayer).

  - _WinLogon_ (as I understand it) deals with things that are run after the computer boots, but before any user logs in (so things that run before the PC gets to the "Login" screen). Generally it has fewer bothersome entries than "Logon", but you can examine it anyway. But be warned, I'm fairly certain it is more dangerous than "Logon".

  - _Services_ are probably the __easiest way to break something__. They do a lot of stuff for your system in the background, so disabling the wrong one can break a lot of stuff in the background without a clearcut reason why (like time syncronization...). I recommend being conservative with these, or even coming back to them later.

  -  _Drivers_, _Codecs_, _Boot Execute_, _Image Hijacks_, _AppInit_, _KnownDLLs_, _Winsock Providers_, _Print Monitors_, _LSA Providers_, and _Network Providers_ are stuff that I seldom touch. You can examine them for things that you are _certain_ you don't need (like if you see something for "WPS" and you know what WPS is), but I just strongly recommend _experimenting_ inside them.



### Process Count ###

Tools: Task Manager or Process Explorer

**Difficulty: MEDIUM**

This is simple: check how many processes are currently running. For consistency, it's best to check right after booting.

As a general rule of thumb, you want a PC to have as close to 50 running processes as possible immediately after boot. If 50 sounds high to you, keep in mind this is also including Windows itself and all the stuff that is critical for it working.

**Why is it needed**
As I said before, the less processes taking up RAM and CPU cycles, the better. A count is a really quick way to just guestimate if you're even in the right ballpark. Every PC is different and so the number '50' is not set in stone, it's just the amount that I've seen that computers generally have after disabling all the crap you don't need. But if you have some program for your work that needs to run all the time or something of the like, you'll have a higher count, unavoidably.

**Warnings**
You _can_ end processes right inside the task manager to try to get the count down, but (a) this doesn't solve how the program began running in the first place and (b) ending the wrong process is bad mojo. Usually when I've done it, it just forces a restart, but just be aware.

**How to use**
Go to the "Processes" tab and check "Show processes from all users" (which requires administrator rights). Now the number at the bottom for "Processes" should be accurate. You can also scroll through the processes and try to get a grasp on what's running that can be disabled, but I can't really say more because it's so specific to each PC.

If you're more adventurous, you can try downloading [Process Explorer] which is like Task Manager on steroids, but I honestly haven't used it enough to give any tips on using it pertaining to this guide.


## OS Checks ##

### chkdsk ###

Tools: chkdsk (included with Windows)

**Difficulty: EASY**
chkdsk ("Check Disk") is a tool used back from DOS days. Sometimes there's a problem not with the files of Windows but with how those files sit on the disk; that is, a problem with the _filesystem_. That's what chkdsk scans for and can often fix.

**Why is it needed**
Filesystem problems are just weird, in my experience. They're sporadic and unpredictable and so can cause problems to Windows, even if they aren't obvious. Basically they're never a good thing.

chkdsk is the default tool for repairing filesystems on Windows, just as a tool call "fdisk" does the same on Linux. Like I said, it's back from DOS days and it's still very useful today.

**Warnings**
Using chkdsk is not without risks. If it does find problems and it can't fix them, it will mark that part of the disk as "bad" for Windows to not use, and if there is a system file or whatever on that part of the disk, it would be gone.

Additionally, you should _never_ interrupt chkdsk or any filesystem repair operation. It can just mess up your disk. Before you start, make sure you have enough time to let it finish, and then let it run to completion.

**How to use**
Pretty simple. Open a command prompt as administrator (Win+R, then type `cmd` and click "OK") then type:

> chkdsk c: /r

The above will actually perform the fixing. If you just want to scan first, you can do:

> chkdsk c:

### sfc ####

Tools: sfc (included with Windows)

**Difficulty: EASY**
sfc ("System File Checked") does what it says: it checks the system files. It makes sure that they haven't changed, either maliciously or by some disk error or whatever.

**Why is it needed**
Pretty simple: if a system file is corrupted in any way, the system may not act the way it's supposed to. It's not that common of a problem and even less likely to just cause speed problems. However, corrupted files are never a good thing so getting rid of them is always a step toward a more healthy PC.

**Warnings**
No warnings to speak of, other than I would recommend not interrupting it for the same reason as chkdsk.

**How to use**
Similar to chkdsk, open a command prompt as administrator (Win+R, then type `cmd` and click "OK") then type:

> sfc /scannow

And now you wait.

### Graphics Driver ###

Tools: N/A

**Difficulty: MEDIUM**
This may seem really weird, but I've included it because it's been known to happen (with ATI anyway...). It's really more of a hail mary but if you're desperate, anything you can try helps.

**Why is it needed**
Occasionally the graphics driver just gets messed up. This can lead to a bunch of bizarre problems, from BSOD to poor performance. This is especially true if the slowness you notice _has to do with visuals_. If it's slow to drag windows, to scroll, or anything of the like, it may have to do with the graphics card.

**Warnings**
As long as you grab the correct driver for your card, you should be completely fine. Though you may have to work at a really low resolution until you get it reinstalled.

**How to use**
First download the driver by the vendor who makes your card.

  - [AMD](http://support.amd.com/en-us/download)
  - [nVidia](http://www.geforce.com/drivers)
  - [Intel](https://downloadcenter.intel.com/)

Punch in whatever device you have and it'll download or use an automatic detector if it's offered and you want to.

Next you need to uninstall the current driver. Get to the Device Manager (from Start Menu, right click "Computer" & select "Properties", should be on the left) and find yours under "Display adapters". Right click it and select "Uninstall".

Finally, run the driver installer that you downloaded and reboot.

## Hardware Checks ##

### Memory ###

Tools: memtest86, memtest86+, Windows Memory Diagnostic Tool

**Difficulty: MEDIUM**
Just like hard drives, RAM ("Random Access Memory") dies too eventually. There are many tools for this but the most popular open source one is called memtest86, which spawned off memtest86+. (The '86' comes from Intel's like of x86 processor architectures, which is what nearly all PCs use nowadays.)

memtest86 is probably the most trusted any/all should be good. The Windows Diagnostic Tool is probably the easiest to use as it's already installed.

**Why is it needed**
Bad memory results in many bad problems from BSOD to random restarts; but sometimes it can be more subtle. 

**Warnings**
N/A

**How to use**
If you want to use Windows' own tool, just open the run dialog (Win+R) and type "mdsched". It will require you to reboot to do the test.

For the memtest86's, you basically download the ISO to burn to a CD or a ZIP to a bootable USB device, both of which are beyond the scope of this guide.

Boot your CD/bootable USB drive and memtest should automatically start. You want to give it several passes, at least 3 to make sure there are no errors. This will take a while.

If you find that your RAM is bad, you'll probably need to replace it. Think of this as a time to get a RAM upgrade! Woohoo!

### SMART and HDD test ###

Tools: Your hard drive vendor's diagnostic test tool, Speccy

**Difficulty: HARD**
SMART is "Self-Monitoring, Analysis and Reporting Technology". Basically, it's the hard drive trying to check itself for malfunctions.

**Why is it needed**
Hardware doesn't last forever. Eventually it breaks down and stops working correctly. If it does, it can cause wacky errors or even data loss. Or it can just start performing poorly. If you discover that your hard drive is dying, replace it.

**Warnings**
Just be careful if a test ever says there could be data loss.

**How to use**
SMART is easy to read with tools like Speccy but hard to interpret. It just spouts off numbers for the values and while some are consistent, others vary from vender to vendor.

The result is that each vendor has its own diagnostic tool which is the easiest thing to trust. Here are a few:

  - Western Digital: Data Lifeguard Diagnostic
  - Seagate: Seagate's SeaTools

For others like Toshiba, Fujitsu, Hitachi, Maxtor, and Samsung, you're on your own in terms of finding it. (Google is your friend.) The tool almost always gives a chance to test the SMART data and additionally can do something like checking writes, but I can't tell you _what_ to run. But if you ever find an error, it's probably a bad sign.


## Advanced Malware ##

 - AdwCleaner
 - RogueKiller
 - SecurityCheck
ComboFix
 - Farbar Recovery Scan Tool (FRST64)
 - ANTI-ROOTKIT:
   - Avast (aswMBR)
   - Kapersky (TDSSKiller)
   - MalwareBytes (mbar)

MBAM Chameleon
HiJackThis

ESET Anti-rootkit???









????????????????????????????


Uhhhh....
### Windows Updates ###
I've never had a Windows Update help performance, and it often hurts it. Example: when they introduced Windows Search 4, which hogged resources by indexing constantly while yielding no new features.




**Difficulty: ???**
**Why is it needed**
**Warnings**
**How to use**


TODO:
  - Add cleaning dust
  - Add boot 2 Linux
  - Add StartupSaver?
  - Add section on building a Thumb Drive
  - SSD TRIM?
  - links to external files (Common Causes, Software Appendix)are broken
  - add http://www.eset.com/online-scanner/
