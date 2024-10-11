---
icon: FoNote
---

# Terminal Keybinds

---

<https://medium.com/israeli-tech-radar/terminal-escape-codes-are-awesome-heres-why-c8eb938b1a1c>
<https://notes.burke.libbey.me/ansi-escape-codes/>
<https://www.xfree86.org/current/ctlseqs.html>
<https://wezfurlong.org/wezterm/escape-sequences.html>
<https://sw.kovidgoyal.net/kitty/keyboard-protocol/>
<https://www.baeldung.com/linux/meta-modifier-keys>
<https://superuser.com/questions/1469968/sending-correct-escape-sequences-in-terminal>
<https://www.linusakesson.net/programming/tty/>
<https://superuser.com/questions/555886/why-cant-i-highlight-text-in-a-linux-terminal-emulator-with-shiftarrow-keys>

## Terminal Keyboard Shortcuts Demystified: A Guide to IDE-like Text Selection

You know how you can press something like Option+Shift+Left to select text in your IDE? (try it here) Try doing that in your terminal (it probably didn't work). Instead, you might see something like this:

-- gif/video here: terminal - echo hello worldCSI

Ever wondered why that happens and what that cryptic text actually means? Well, I'll explain that and a lot of other things you probably never wanted to know about terminal and shell key handling.

I'll also show you how to setup your terminal and shell so that you can use keybinds like Cmd+Shift+Right to select text just like you do in your IDE.

-- gif/video: terminal showing selection

If you want to skip the technical explanation and get natural text selection in your terminal, click here: "shut up and take me to the guide"

Before we get into what `[5;4~` actually means, we should go over how a keypress gets from your keyboard to your terminal in the first place.

## The keypress journey (wip)

(Hardware) Keyboard (Scancodes, physical key) -> Connection (USB/Bluetooth) -> low-level OS drivers (scancodes mapped to key events) -> keyevent sent to window server -> to application

This is missing a lot of smaller steps and is not entirely accurate.

At each "level", your keypress might be captured/used. If it is, the keypress never reaches the next level. Otherwise, the keypress is passed along.

Keyboard - Some keybind to change RGB, never sent to the computer.
(middle step? e.g. media eject button)
System-level binds - ctrl-down
something like cmd+q isn't actually guaranteed, still sent to application (see key codes app)

So how does this help us use a keybind like Option+Shift+Left in the shell? We just have to make sure that it gets passed all the way through to the shell. And then as long as the shell lets us _do_ something with that key event, we can get whatever effect we want.

"dead keys" (not actually dead?)
give example of a key press at each level
key codes app

There are some standard ways to manipulate text [Common zsh Keyboard Shortcuts on macOS Catalina · GitHub](https://gist.github.com/mkfares/e23eb57d943145eb543d97ac7ef05732)
but that's lame, i want to use the same keybinds in my IDE and in my terminal

These are mostly the same across various shells e.g. sh, bash, zsh, fish

how keyboard events are processed
[Event Architecture](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/EventOverview/EventArchitecture/EventArchitecture.html)
[GitHub - alex/what-happens-when: An attempt to answer the age old interview question "What happens when you type google.com into your browser and press enter?"](https://github.com/alex/what-happens-when#on-os-x-a-keydown-nsevent-is-sent-to-the-app)
[Computer keyboard - Wikipedia](https://en.wikipedia.org/wiki/Computer_keyboard#Technology)

try pressing control left, not sent to terminal

talk about terminal vs shell
pty/tty

pressing option + key usually sends \e

wezterm keydebug

iterm natural text processing

[GitHub - alex/what-happens-when: An attempt to answer the age old interview question "What happens when you type google.com into your browser and press enter?"](https://github.com/alex/what-happens-when#the-g-key-is-pressed)

ctrl sends \c

guess the escape sequence game

What is the meta key actually?

link to everything a developer should know about unicode

there's no such thing as raw text, its (probabl) all UTF-8
