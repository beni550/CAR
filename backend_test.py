#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class RechevILAPITester:
    def __init__(self, base_url="https://vehicle-checker-12.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def test_api_endpoint(self, method, endpoint, expected_status, data=None, headers=None, description=""):
        """Generic API endpoint tester"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=15)
            else:
                self.log_test(f"{method} {endpoint}", False, f"Unsupported method: {method}")
                return None

            success = response.status_code == expected_status
            details = ""
            if not success:
                try:
                    error_data = response.json()
                    details = error_data.get('detail', 'Unknown error')
                except:
                    details = response.text[:100] if response.text else "No response body"

            self.log_test(f"{method} {endpoint} {description}", success, details, expected_status, response.status_code)
            
            if success:
                try:
                    return response.json()
                except:
                    return response.text
            return None

        except requests.exceptions.RequestException as e:
            self.log_test(f"{method} {endpoint} {description}", False, f"Request failed: {str(e)}")
            return None

    def test_vehicle_apis(self):
        """Test vehicle-related APIs with test plate 1234567"""
        print("\n🚗 Testing Vehicle APIs...")
        
        # Test vehicle search
        vehicle_data = self.test_api_endpoint('GET', 'vehicle/search?plate=1234567', 200, description="(Basic Search)")
        
        # Test full vehicle check
        full_data = self.test_api_endpoint('GET', 'vehicle/full?plate=1234567', 200, description="(Full Check)")
        
        # Test theft check
        self.test_api_endpoint('GET', 'vehicle/theft?plate=1234567', 200, description="(Theft Check)")
        
        # Test disability check
        self.test_api_endpoint('GET', 'vehicle/disability?plate=1234567', 200, description="(Disability Check)")
        
        # Test invalid plate
        self.test_api_endpoint('GET', 'vehicle/search?plate=123', 400, description="(Invalid Plate)")
        
        # Test non-existent plate
        self.test_api_endpoint('GET', 'vehicle/search?plate=9999999', 404, description="(Non-existent Plate)")
        
        return vehicle_data, full_data

    def test_stats_api(self):
        """Test stats API"""
        print("\n📊 Testing Stats API...")
        return self.test_api_endpoint('GET', 'stats', 200, description="(Get Stats)")

    def create_test_user_session(self):
        """Create test user and session in MongoDB for auth testing"""
        print("\n👤 Creating test user session...")
        
        # This would normally be done via mongosh, but for testing we'll try the auth flow
        # Since we can't directly access MongoDB, we'll skip this and test without auth
        print("⚠️  Skipping MongoDB session creation - would need direct DB access")
        return False

    def test_auth_apis(self):
        """Test authentication APIs"""
        print("\n🔐 Testing Auth APIs...")
        
        # Test /auth/me without authentication (should fail)
        self.test_api_endpoint('GET', 'auth/me', 401, description="(No Auth)")
        
        # Test logout without authentication
        self.test_api_endpoint('POST', 'auth/logout', 200, description="(Logout No Auth)")

    def test_protected_apis(self):
        """Test protected APIs (history, favorites) without auth"""
        print("\n🔒 Testing Protected APIs (without auth)...")
        
        # These should all return 401 without authentication
        self.test_api_endpoint('GET', 'history', 401, description="(Get History - No Auth)")
        self.test_api_endpoint('POST', 'history', 401, 
                             data={"plate": "1234567", "manufacturer": "Test", "model": "Test"}, 
                             description="(Add History - No Auth)")
        self.test_api_endpoint('GET', 'favorites', 401, description="(Get Favorites - No Auth)")
        self.test_api_endpoint('POST', 'favorites', 401,
                             data={"plate": "1234567", "manufacturer": "Test", "model": "Test"},
                             description="(Add Favorite - No Auth)")

    def test_ai_recognition_api(self):
        """Test AI recognition API (without actual image)"""
        print("\n🤖 Testing AI Recognition API...")
        
        # Test without file (should fail)
        try:
            url = f"{self.api_url}/vehicle/ai-recognize"
            response = requests.post(url, timeout=15)
            success = response.status_code == 422  # FastAPI validation error for missing file
            self.log_test("POST vehicle/ai-recognize (No File)", success, 
                         "Missing file parameter" if success else f"Unexpected status: {response.status_code}",
                         422, response.status_code)
        except Exception as e:
            self.log_test("POST vehicle/ai-recognize (No File)", False, f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Rechev IL Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Test basic vehicle APIs
        vehicle_data, full_data = self.test_vehicle_apis()
        
        # Test stats API
        stats_data = self.test_stats_api()
        
        # Test auth APIs
        self.test_auth_apis()
        
        # Test protected APIs
        self.test_protected_apis()
        
        # Test AI recognition
        self.test_ai_recognition_api()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            
            # Print failed tests
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['name']}: {result['details']}")
            
            return 1

    def get_test_summary(self):
        """Get detailed test summary for reporting"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    tester = RechevILAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results for reporting
    summary = tester.get_test_summary()
    with open('/tmp/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())