# https://www.hackerrank.com/challenges/decorators-2-name-directory
import operator

def person_lister(f):
    def inner(people):
        from operator import itemgetter

        people.sort(key=itemgetter(2))
        for i in range(0,len(people)):
          people[i] = f(people[i])

        return people
    return inner

@person_lister
def name_format(person):
    return ("Mr. " if person[3] == "M" else "Ms. ") + person[0] + " " + person[1]

if __name__ == '__main__':
    people = [input().split() for i in range(int(input()))]
    print(*name_format(people), sep='\n')