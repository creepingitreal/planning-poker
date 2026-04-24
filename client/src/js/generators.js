export function randomNameGenerator() {

    const adjectives = [
        "Luminous", "Brash", "Cryptic", "Winsome", "Ragged", "Vexing", "Jovial", "Murky", "Nimble", "Ghastly",
        "Zesty", "Meek", "Feral", "Lofty", "Quirky", "Sullen", "Gritty", "Wily", "Dreary", "Snappy",
        "Bizarre", "Feisty", "Grimy", "Hearty", "Jaded", "Keen", "Lanky", "Mellow", "Nifty", "Plucky",
        "Cold-hearted", "Razor-sharp", "Bone-weary", "High-strung", "Wide-eyed", "Red-handed", "Stone-faced", "Quick-witted",
        "Deep-rooted", "Star-crossed", "Long-winded", "Heavy-handed", "Soft-spoken", "Open-ended", "Yellow-bellied",
        "Silver-tongued", "Short-tempered", "Close-knit", "Well-heeled", "Hard-nosed", "Bright-eyed", "Time-worn",
        "Weather-beaten", "Battle-hardened", "Smoke-stained", "Sun-drenched", "Dust-covered", "Moon-touched", "Sharp-tongued",
        "Even-tempered", "Digital", "Quantum", "Neural", "Encrypted", "Binary", "Virtual", "Synthetic", "Robotic", "Automated",
        "Cybernetic", "Augmented", "Magnetic", "Analog", "Reactive", "Modular", "Scalable", "Dynamic", "Cloud-based", "Nano",
        "Electromagnetic", "Programmable", "AI-powered", "Self-learning", "Data-driven", "Real-time", "Machine-based",
        "Sensorial", "Tech-savvy", "Smart", "Bio-digital"
    ];

    const nouns = [
        "Fox", "Tiger", "Eagle", "Storm", "Shadow", "Flame", "Branch", "Chopper", "Knight", "Wanderer",
        "Specter", "Beacon", "Drifter", "Hunter", "Seeker", "Oracle", "Bard", "Nomad", "Warden", "Rebel",
        "Forge", "Crown", "Thorn", "Fang", "Echo", "Whisper", "Blaze", "Riddle", "Rune", "Talon",
        "Gale", "Mist", "Shard", "Spire", "Cinder", "Ash", "Bolt", "Quill", "Hollow", "Frost",
        "Vortex", "Pulse", "Glare", "Veil", "Claw", "Grasp", "Root", "Stone", "Wing", "Howl",
        "Banner", "Anvil", "Scroll", "Lantern", "Maze", "Drum", "Horn", "Thread", "Scale", "Ember",
        "Server", "Protocol", "Algorithm", "Network", "Database", "Interface", "Kernel", "Cluster", "Node", "Packet",
        "Gateway", "Firmware", "Bitstream", "Cache", "Script", "Console", "Terminal", "Pipeline", "Socket", "Daemon",
        "Instance", "Thread", "Module", "Compiler", "Driver", "Registry", "Payload", "Token", "Hash", "Stream"
    ];

    const descriptiveNouns = [
        "Choppers", "Runners", "Breakers", "Wanderers", "Seekers", "Hunters", "Slashers", "Crafters", "Shifters", "Drifters",
        "Stalkers", "Strikers", "Builders", "Smashers", "Snatchers", "Watchers", "Callers", "Fighters", "Lurkers", "Grinders",
        "Weavers", "Tamers", "Riders", "Divers", "Climbers", "Slicers", "Trackers", "Blazers", "Thrashers", "Brawlers",
        "Crushers", "Dancers", "Singers", "Painters", "Carvers", "Forgers", "Binders", "Casters", "Wielders", "Harvesters",
        "Scavengers", "Guardians", "Raiders", "Sculptors", "Slingers", "Spinners", "Thieves", "Healers", "Breakers", "Callers",
        "Reapers", "Snipers", "Gliders", "Lancers", "Menders", "Chanters", "Hackers", "Fixers", "Prowlers", "Jumpers",
        "Hackers", "Coders", "Processors", "Renderers", "Compilers", "Encryptors", "Transmitters", "Analyzers", "Synthesizers", "Automators",
        "Debuggers", "Loaders", "Streamers", "Crawlers", "Indexers", "Deployers", "Integrators", "Upgraders", "Connectors", "Modulators",
        "Architects", "Operators", "Technologists", "Innovators", "Engineers", "Designers", "Developers", "Optimizers", "Calibrators", "Diagnosticians"
    ];

    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

    const part1 = pickRandom(adjectives);
    const part2 = pickRandom(nouns);
    const part3 = pickRandom(descriptiveNouns);
    const number = Math.random().toString(36).substring(2, 6).toUpperCase()

    return `${part1} ${part2} ${part3}`;
}

// console.log(randomNameGenerator());


export function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rawId = '';

    for (let i = 0; i < 8; i++) {
        rawId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Insert hyphens every 2 characters
    return rawId.match(/.{1,2}/g).join('-'); // e.g., "aB-3d-X9-zQ"
}

// const roomId = generateRoomId();
// console.log(roomId);
