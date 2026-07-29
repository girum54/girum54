const https = require('https');

const USERNAME = 'girum54';

function fetch(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'GitHub-Stats-Script'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchGitHubStats() {
    const userUrl = `https://api.github.com/users/${USERNAME}`;
    const reposUrl = `https://api.github.com/users/${USERNAME}/repos?per_page=100`;
    
    const [userData, reposData] = await Promise.all([
        fetch(userUrl),
        fetch(reposUrl)
    ]);
    
    return { userData, reposData };
}

function calculateLanguageStats(repos) {
    const languages = [];
    repos.forEach(repo => {
        if (repo.language) {
            languages.push(repo.language);
        }
    });
    
    const langCounts = {};
    languages.forEach(lang => {
        langCounts[lang] = (langCounts[lang] || 0) + 1;
    });
    
    const total = languages.length;
    const langStats = Object.entries(langCounts)
        .map(([lang, count]) => ({
            language: lang,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    return langStats;
}

function generateMarkdown(userData, langStats) {
    let md = `# Hi! Girum Tilahun here.

<br>

## Languages

| Language | Repos | % |
|----------|-------|---|
`;
    langStats.forEach(stat => {
        md += `| ${stat.language} | ${stat.count} | ${stat.percentage}% |\n`;
    });
    
    md += `
<br><br>

## ✨ Stats

`;
    md += `- **Public Repos**: ${userData.public_repos || 0}\n`;
    md += `- **Followers**: ${userData.followers || 0}\n`;
    md += `- **Following**: ${userData.following || 0}\n`;
    md += `- **Account Created**: ${userData.created_at ? userData.created_at.split('T')[0] : 'N/A'}\n`;
    
    md += `
<br><br>

\`\`\`
💌 girumtilahun54@gmail.com
\`\`\`
`;
    return md;
}

async function main() {
    console.log(`Fetching stats for ${USERNAME}...`);
    
    try {
        const { userData, reposData } = await fetchGitHubStats();
        
        if (userData.message) {
            console.error(`Error: ${userData.message}`);
            return;
        }
        
        const langStats = calculateLanguageStats(reposData);
        const markdown = generateMarkdown(userData, langStats);
        
        const fs = require('fs');
        fs.writeFileSync('README.md', markdown, 'utf-8');
        
        console.log('✅ README.md updated successfully!');
        console.log(`\nStats summary:`);
        console.log(`- Total repos: ${reposData.length}`);
        console.log(`- Languages: ${langStats.length}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
