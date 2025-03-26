def create_balanced_teams(students):
    # Sort students by performance type and average marks
    toppers = sorted([s for s in students if s['performance_type'] == 'Topper'], 
                    key=lambda x: x['average_marks'], reverse=True)
    
    average = sorted([s for s in students if s['performance_type'] == 'Average'], 
                    key=lambda x: x['average_marks'], reverse=True)
    
    duller = sorted([s for s in students if s['performance_type'] == 'Duller'], 
                    key=lambda x: x['average_marks'], reverse=True)
    
    # Calculate number of teams based on the smallest group
    team_count = min(len(toppers), len(average), len(duller))
    
    # Create balanced teams
    teams = []
    for i in range(team_count):
        team = [
            str(toppers[i]['_id']),
            str(average[i]['_id']),
            str(duller[i]['_id'])
        ]
        teams.append(team)
    
    # Handle remaining students
    remaining = (toppers[team_count:] if team_count < len(toppers) else []) + \
                (average[team_count:] if team_count < len(average) else []) + \
                (duller[team_count:] if team_count < len(duller) else [])
    
    # Distribute remaining students across teams
    for i, student in enumerate(remaining):
        teams[i % len(teams)].append(str(student['_id']))
    
    return teams 