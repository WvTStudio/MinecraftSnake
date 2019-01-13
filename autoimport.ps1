rm -Recurse C:\Users\atwzj\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\minecraftWorlds\*
rm "Snake.mcworld"
7z a "Snake.zip" *
mv "Snake.zip" "Snake.mcworld"
start "Snake.mcworld"