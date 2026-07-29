import requests
import json
from collections import Counter

USERNAME = "girum54"

def fetch_github_stats():
    """Fetch GitHub stats for the user"""
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    # Get user profile
    user_url = f"https://api.github.com/users/{USERNAME}"
    user_response = requests.get(user_url, headers=headers)
    user_data = user_response.json()
    
    # Get repositories
    repos_url = f"https://api.github.com/users/{USERNAME}/repos?per_page=100"
    repos_response = requests.get(repos_url, headers=headers)
    repos_data = repos_response.json()
    
    return user_data, repos_data

def calculate_language_stats(repos):
    """Calculate language statistics from repositories"""
    languages = []
    for repo in repos:
        if repo.get("language"):
            languages.append(repo["language"])
    
    lang_counts = Counter(languages)
    total = sum(lang_counts.values())
    
    lang_stats = []
    for lang, count in lang_counts.most_common(10):
        percentage = (count / total) * 100 if total > 0 else 0
        lang_stats.append({
            "language": lang,
            "count": count,
            "percentage": round(percentage, 1)
        })
    
    return lang_stats

def generate_markdown(user_data, lang_stats):
    """Generate markdown content for README"""
    md = f"""# Hi! Girum Tilahun here.

<br>

## Languages

| Language | Repos | % |
|----------|-------|---|
"""
    for stat in lang_stats:
        md += f"| {stat['language']} | {stat['count']} | {stat['percentage']}% |\n"
    
    md += """
<br><br>

## ✨ Stats

"""
    md += f"- **Public Repos**: {user_data.get('public_repos', 0)}\n"
    md += f"- **Followers**: {user_data.get('followers', 0)}\n"
    md += f"- **Following**: {user_data.get('following', 0)}\n"
    md += f"- **Account Created**: {user_data.get('created_at', 'N/A')[:10]}\n"
    
    md += """
<br><br>

```
💌 girumtilahun54@gmail.com
```
"""
    return md

def main():
    print(f"Fetching stats for {USERNAME}...")
    user_data, repos_data = fetch_github_stats()
    
    if "message" in user_data:
        print(f"Error: {user_data['message']}")
        return
    
    lang_stats = calculate_language_stats(repos_data)
    markdown = generate_markdown(user_data, lang_stats)
    
    # Write to README
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(markdown)
    
    print("✅ README.md updated successfully!")
    print(f"\nStats summary:")
    print(f"- Total repos: {len(repos_data)}")
    print(f"- Languages: {len(lang_stats)}")

if __name__ == "__main__":
    main()
