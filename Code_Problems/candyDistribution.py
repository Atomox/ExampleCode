# Enter your code here. Read input from STDIN. Print output to STDOUT
import sys

count = sys.stdin.readline();
grades = [];
scores = {};

for i in sys.stdin:
  grades.append(long(i.rstrip()))

def chunkScore (s):

  if len(s) == 1:
    return [1]

  s1 = s[:len(s)//2];
  s2 = s[len(s)//2:];

  return mergeScore(s1, s2, chunkScore(s1), chunkScore(s2))


def mergeScore (s1, s2, score1, score2):

  if (s1[len(s1)-1] > s2[0] and score1[len(score1)-1] <= score2[0]):
    score1 = scoreLeft(s1, s2, score1, score2)
  elif (s1[len(s1)-1] < s2[0] and score1[len(score1)-1] >= score2[0]):
    score2 = scoreRight(s1, s2, score1, score2)

  return score1 + score2


def scoreSet(s, sCompare, score, s_min):

  prev = 0
  prev_old = 0

  for i in range(len(s)):
    if i == 0:
      if score[i] < s_min:
        score[i] = s_min + 1
      else:
        score[i] = score[i] + 1
    # Is it increasing? Is this only 1 greater than the last?
    elif s[i] > s[i-1] and (score[i-1] - score[i]) <= 1:
        score[i] = score[i-1] + 1
    else:
        break

  return score


def scoreRight(s1, s2, score1, score2):
    s_min = score1[len(score1)-1]
    # Flip s1, so we can always check the same index for comparison scores.
    s1 = s1[::-1]
    return scoreSet(s2, s1, score2, s_min)

def scoreLeft(s1, s2, score1, score2):
    # When scoring left, flip the array. Then flip back when complete.
    s_min = score2[0]
    score1 = score1[::-1]
    s1 = s1[::-1]
    score1 = scoreSet(s1, s2, score1, s_min)
    score1 = score1[::-1]

    return score1

print sum(chunkScore(grades))
