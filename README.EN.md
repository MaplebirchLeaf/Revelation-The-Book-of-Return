[中文](README.md) | [English](README.EN.md)

# Revelation: The Book of Return

[![Game](https://img.shields.io/badge/Game-Degrees%20of%20Lewdity-purple)](https://gitgud.io/Vrelnir/degrees-of-lewdity)
[![Framework](https://img.shields.io/badge/Framework-maplebirch-blue)](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchFramework)
[![Issues](https://img.shields.io/github/issues-raw/MaplebirchLeaf/Revelation-The-Book-of-Return?label=issues)](https://github.com/MaplebirchLeaf/Revelation-The-Book-of-Return/issues)

**Revelation: The Book of Return** is a _Degrees of Lewdity_ story mod built on the [Maplebirch Framework](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchFramework). **Version 1.1.1 includes Robin's temple route, the Confounded Vow, the temple choir and Kylar's Lost Lamb dream.** Future updates will expand character stories and add further story modules.

---

## Contents

- [Installation and dependencies](#installation-and-dependencies)
- [Modules and game guide](#modules-and-game-guide)
- [Current content in 1.1.1](#current-content-in-111)
- [Deadwood Reblooms integration](#deadwood-reblooms-integration)
- [Future updates](#future-updates)
- [Acknowledgements and related projects](#acknowledgements-and-related-projects)
- [Reporting issues](#reporting-issues)

## Installation and dependencies

1. Use **DoL 0.5.12.13** with SugarCube 2 ModLoader.
2. Load the [Maplebirch Framework](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchFramework), satisfying `maplebirch >= 5.2.2`, together with the mod package's other dependencies.
3. Load `revelation-the-book-of-return-*.modpack` from [Releases](https://github.com/MaplebirchLeaf/Revelation-The-Book-of-Return/releases).
4. Enable the root and desired submodules in the framework's module manager. Save before reloading after a module change.

Deadwood Reblooms is optional and is not required for the base stories. This version targets DoL 0.5.12.13. Entries still depend on vanilla membership, clothing, relationships, character state and schedules.

## Modules and game guide

| Module        | Content                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `RBR`         | Root module and submodule dependencies                                                   |
| `RobinTemple` | Robin's admission, temple life, promise ceremony, Confounded Vow and joint examinations  |
| `TempleChoir` | Jordan's choir work, singing skill, lead permission and monthly allowance additions      |
| `LostLamb`    | Kylar's manor dream, two branches and a main ending, waking conversations and Dream Scar |

Disabling `RBR` stops all Revelation submodules. The choir can be enabled independently and does not require Robin to join the temple.

With **Deadwood Reblooms 1.3.0** installed and enabled, open **Mod Hints** in the sidebar for Revelation's detailed chapters. The directory provides chapter links, search and module checkboxes. Chapters cover prerequisites, unlocking, locations, steps, effects and troubleshooting. Check **Journal → Robin and the Temple / Temple Choir / Kylar's manor** for current progress and next steps.

## Current content in 1.1.1

### Robin's temple route

After passing the vanilla admission trial, remaining fully clothed and below maximum stress, and developing a close relationship with Robin, start in **Orphanage → Robin's room** while Robin is able to participate. Visit Jordan together, book and prepare for the purity trial, then complete the assessment to unlock Robin's seat and changing area. The bunk and Saturday stay require Robin to pass the vigil and reach monk rank. Chastity fittings change the invitation's opening dialogue rather than gating the invitation.

Temple life includes shared duties, mass preparation, prayer, gifts, walks, night companionship and a hospital branch. Robin's faith, doubt, contribution and shared experiences affect the route. Entries follow school, temple and other work schedules.

With the required relationship and contributions, request an assessment and hold the promise ceremony. The joint vigil preserves the vanilla trial. Promised partners still face monthly examinations, shared purification after broken vows and chastity-device procedures. Relationship gains alone do not bypass those steps. Device removal requires an application followed by an appointment while Jordan is available.

Route progress is stored in the current save's `$RobinTemple`.

### The Confounded Vow

This late-game branch connects to vanilla **pagan rites, the Hopeless Cycle and underwater visions**. With close relationships with Robin and Sydney and one existing promise, begin through private conversations, survey the lake route, then investigate the underwater ruins on a suitable blood-moon night.

Sydney must remain corrupt. The first promised partner determines whether Sydney's corrupt ritual is also required. All three must be free of chastity devices, and the ceremony checks relationships, desire, vows and physical condition. Agreeing to investigate does not mean agreeing to the ceremony. After witnessing the response, return and discuss it separately, or attempt same-night persuasion with skulduggery checks and relationship consequences.

Completion grants the **Confounded Vow** and connects a second promise, with subsequent changes to joint examinations. Pursuit, weather, lake conditions and character state affect departure and can interrupt the journey. See the game guide for detailed prerequisites and branches.

### Temple choir and singing

As an eligible temple member, ask Jordan about the choir in the **temple hall**. After joining, practise breathing, pitch or choral singing, and take part in Sunday's three-part mass. Choose to follow, support the harmony or lead according to your current ability and permission.

The new **Singing** skill uses vanilla skill grades. Harpy transformation improves performance, while fatigue and alcohol reduce it. Lead permission requires **base Singing at grade B**, as well as the necessary practice, completed services and performance.

Completed services accumulate an allowance addition, **paid with the vanilla allowance after a successful monthly examination when payment is authorised**. There is no immediate Sunday payout. Leaving early uses that day's mass opportunity and provides no addition for the unfinished service. The journal records practice, services, lead permission and pending earnings.

### Lost Lamb: Kylar's manor dream

Discover the manor's monstrance, hear Kylar's recollection of the night the parents changed, and experience the first vanilla manor sleep event. Choose **Lie down for a while** in **Kylar's room**, then close your eyes.

Act as the younger Kylar, from Sydney's afternoon visit through missed visits, breaking glass and the following days. Doubt, unease, attention, action order and dream time determine what you hear, whether you are noticed and how you continue. Failed checks offer recovery paths. Games and checks cannot be repeatedly farmed.

**Complete both branches to unlock the main ending.** Wake and resume at any time. After an ending, re-enter directly at the doorway to choose another dream. Each entry advances the present by thirty minutes, while waking restores present appearance, items, money, weather and character states. The journal records dream dates, clues and progress.

Complete the main ending and wake to gain the **Lost Lamb** feat and **Dream Scar** trait, reducing ongoing nightmare stress during sleep by 25%. Afterwards, talk to Kylar once in the evening, with responses reflecting affection and jealousy. The dream does not settle the cause of the parents' transformation or reconcile Kylar and Sydney.

## Deadwood Reblooms integration

| Enabled content                          | Integration                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Robin expansion                          | Tutoring, stands, shop work and hospital stays affect the schedule, and temple income joins Robin's ledger     |
| Vanilla additions                        | Shared homes affect return and overnight plans, and Unyielding Will changes vigil and Confounded Vow responses |
| More love interests and social portraits | Awareness grades can retain both Robin and Sydney as lovers, while dual promises still require the ceremony    |
| NPC sidebar portraits                    | Initiate robes, monk or nun robes and sleepwear change with scenes                                             |
| More transformations                     | Visible parts from full horse, fish or raven transformation unlock temple-pew interactions                     |

The full-harpy singing interaction can also practise Singing. Integrations check enabled modules and current character state. The base temple route and choir work remain available without Deadwood Reblooms.

## Future updates

Version 1.1.1 contains the routes and dream described above, rather than the mod's entire planned scope. Future versions will refine existing routes and introduce more character stories and independent story modules. Release notes and the game guide will document new content and its prerequisites as it arrives.

## Acknowledgements and related projects

Robin's temple route rebuilds material from the author's earlier Maplebirch mod, continuing vanilla character relationships and temple procedures. Thanks to the original game and dependency maintainers, and to players who provide ideas, testing and feedback.

- [Degrees of Lewdity](https://gitgud.io/Vrelnir/degrees-of-lewdity)
- [Maplebirch Framework](https://github.com/MaplebirchLeaf/SCML-DOL-maplebirchFramework)
- [Deadwood Reblooms](https://github.com/MaplebirchLeaf/Deadwood-Reblooms)
- [1.1.1 release notes](.github/release-notes/v1.1.1.md)

## Reporting issues

Open an [issue](https://github.com/MaplebirchLeaf/Revelation-The-Book-of-Return/issues) with game, framework and mod versions, enabled modules, location, steps and the complete error. For Robin's whereabouts, include the in-game time, shared residence and current work. For promises or choir payments, include the promised partner and monthly-examination progress. For Lost Lamb, include the dream location, time, selected action and whether the issue occurred during the dream or after waking.
