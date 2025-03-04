/**
 * Authentication Test Runner
 *
 * This script provides a command-line interface for running authentication tests.
 * It can be used to test the authentication flow without the UI.
 *
 * Usage:
 * ```
 * npx ts-node run-auth-tests.ts --test=basic
 * npx ts-node run-auth-tests.ts --test=suite --email=user@example.com --password=password
 * npx ts-node run-auth-tests.ts --test=stress --email=user@example.com --password=password --iterations=3
 * ```
 */

import { testAuthFlow } from "./auth-test"
import { runAuthStressTest, runAuthTestSuite } from "./auth-test-suite"

// Parse command line arguments
const args = process.argv.slice(2)
const options: Record<string, string> = {}

args.forEach((arg) => {
  const [key, value] = arg.split("=")
  if (key && value) {
    options[key.replace(/^--/, "")] = value
  }
})

// Default test type
const testType = options.test || "basic"

/**
 * Run the specified test
 */
async function runTests() {
  console.log(`Running ${testType} authentication tests...`)

  try {
    switch (testType) {
      case "basic":
        // Run basic auth flow test
        const basicResults = await testAuthFlow()
        console.log("\n=== Basic Auth Test Results ===")
        console.log(JSON.stringify(basicResults, null, 2))

        // Print summary
        console.log("\n=== Summary ===")
        console.log(
          `Has Stored Session: ${basicResults.hasStoredSession ? "✓" : "✗"}`
        )
        console.log(`Session Valid: ${basicResults.sessionValid ? "✓" : "✗"}`)
        console.log(
          `Refresh Successful: ${basicResults.refreshSuccessful ? "✓" : "✗"}`
        )
        console.log(`User Retrieved: ${basicResults.userRetrieved ? "✓" : "✗"}`)

        if (basicResults.errors.length > 0) {
          console.log("\n=== Errors ===")
          basicResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`)
          })
        }
        break

      case "suite":
        // Run comprehensive test suite
        const suiteOptions: any = { timeoutMs: 10000 }

        // Add credentials if provided
        if (options.email && options.password) {
          suiteOptions.credentials = {
            email: options.email,
            password: options.password
          }
          suiteOptions.runSignInTests = true
        }

        const suiteResults = await runAuthTestSuite(suiteOptions)
        console.log("\n=== Auth Test Suite Results ===")
        console.log(
          `Overall Success: ${suiteResults.overallSuccess ? "✓" : "✗"}`
        )
        console.log(`Total Tests: ${suiteResults.summary.total}`)
        console.log(`Passed: ${suiteResults.summary.passed}`)
        console.log(`Failed: ${suiteResults.summary.failed}`)
        console.log(
          `Total Duration: ${(suiteResults.totalDuration / 1000).toFixed(2)}s`
        )

        console.log("\n=== Test Details ===")
        suiteResults.tests.forEach((test, index) => {
          console.log(
            `${index + 1}. ${test.name}: ${test.success ? "✓" : "✗"} (${(test.duration / 1000).toFixed(2)}s)`
          )
          if (test.error) {
            console.log(`   Error: ${test.error}`)
          }
        })
        break

      case "stress":
        // Check if credentials are provided
        if (!options.email || !options.password) {
          console.error(
            "Error: Email and password are required for stress testing"
          )
          process.exit(1)
        }

        // Run stress test
        const iterations = parseInt(options.iterations || "3", 10)
        const stressResults = await runAuthStressTest({
          credentials: {
            email: options.email,
            password: options.password
          },
          iterations,
          delayBetweenMs: 1000
        })

        console.log("\n=== Auth Stress Test Results ===")
        console.log(`Overall Success: ${stressResults.success ? "✓" : "✗"}`)
        console.log(`Iterations: ${stressResults.iterations}`)
        console.log(`Completed: ${stressResults.completedIterations}`)
        console.log(`Failed: ${stressResults.failures.length}`)
        console.log(
          `Average Duration: ${stressResults.averageDuration.toFixed(2)}ms`
        )

        if (stressResults.failures.length > 0) {
          console.log("\n=== Failures ===")
          stressResults.failures.forEach((failure) => {
            console.log(`Iteration ${failure.iteration}: ${failure.error}`)
          })
        }
        break

      default:
        console.error(`Error: Unknown test type '${testType}'`)
        console.log("Available test types: basic, suite, stress")
        process.exit(1)
    }
  } catch (error) {
    console.error("Error running tests:", error)
    process.exit(1)
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log("\nTests completed.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })

export {}
