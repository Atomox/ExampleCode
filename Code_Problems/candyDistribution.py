# Solution for Candy Problem.
# @see https://www.hackerrank.com/challenges/candies/problem
# author: atomox@gmail.com
import sys
grades = [];
scores = {};


def chunkScore (a, b):

  if a >= b:
    scores[a] = 1
    return

  # Divide and conquer.
  middle = a + ((b-a) // 2)
  chunkScore(a, middle)
  chunkScore(middle + 1, b)

  # When we merge, determine which id needs to be scored.
  if (grades[middle] > grades[middle+1] and scores[middle] <= scores[middle+1]):
    scoreLeft(a, middle, middle+1, b)
  elif (grades[middle] < grades[middle+1] and scores[middle] >= scores[middle+1]):
    scoreRight(a, middle, middle+1, b)


def scoreSet(a, b, y, z, is_backwards):

  last = z
  step = 1

  if is_backwards == True:
      a,b = b,a
      b = b - 1  # range(a,b) is actually a -> b-1
      last = y
      step = -1
  else:
      b = b + 1  # range(a,b) is actually a -> b-1

  for i in range(a,b, step):
    if i == a:
        scores[i] = max(scores[last] + 1, scores[i] + 1)
    elif grades[i] > grades[last]:
        scores[i] = max(scores[last] + 1, scores[i])
    else:
        break

    last = i


def scoreRight(a, b, y, z):
    scoreSet(y, z, a, b, False)


def scoreLeft(a, b, y, z):
    score1 = scoreSet(a, b, y, z, True)


# Import scores, and initialize score chart.
count = sys.stdin.readline();
for i in sys.stdin:
  grades.append(int(i.rstrip()))
scores = [1] * len(grades)

# Calculate the score. Then total it.
chunkScore(0, len(grades)-1)
print sum(scores)
